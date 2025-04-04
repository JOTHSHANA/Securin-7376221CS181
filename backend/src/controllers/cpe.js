const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const sax = require("sax");
// const { XMLParser } = require("fast-xml-parser");

exports.getAllCPEs = async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;
  
      const [rows] = await db.query(
        "SELECT * FROM cpe_entries ORDER BY id LIMIT ? OFFSET ?", 
        [limit, offset]
      );
  
      const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM cpe_entries");
  
      res.json({ page, limit, total, data: rows });
    } catch (err) {
      console.error("❌ Error fetching CPEs:", err);
      res.status(500).json({ error: err.message });
    }
  };
  

exports.searchCPEs = async (req, res) => {
    try {
      let query = "SELECT * FROM cpe_entries WHERE 1=1";
      let params = [];
  
      if (req.query.cpe_title) {
        query += " AND cpe_title LIKE ?";
        params.push(`%${req.query.cpe_title}%`);
      }
      if (req.query.cpe_22_uri) {
        query += " AND cpe_22_uri LIKE ?";
        params.push(`%${req.query.cpe_22_uri}%`);
      }
      if (req.query.cpe_23_uri) {
        query += " AND cpe_23_uri LIKE ?";
        params.push(`%${req.query.cpe_23_uri}%`);
      }
  
      if (req.query.deprecation_date) {
        const deprecationDate = req.query.deprecation_date;
        if (isNaN(Date.parse(deprecationDate))) {
          return res.status(400).json({ error: "Invalid date format" });
        }
        query += ` AND (
          (cpe_22_deprecation_date IS NOT NULL AND cpe_22_deprecation_date <= ?)
          OR 
          (cpe_23_deprecation_date IS NOT NULL AND cpe_23_deprecation_date <= ?)
        )`;
        params.push(deprecationDate, deprecationDate);
      }
  
      const [rows] = await db.query(query, params);
      res.json({ data: rows });
    } catch (err) {
      console.error("Error executing search:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  exports.importCPEData = async (req, res) => {
    try {
        const xmlFilePath = path.join(__dirname, "../data/data.xml");

        if (!fs.existsSync(xmlFilePath)) {
            console.error("❌ XML file not found:", xmlFilePath);
            return res.status(404).json({ error: "XML file not found" });
        }

        console.log("✅ XML file found. Starting parsing...");

        const stream = fs.createReadStream(xmlFilePath, { encoding: "utf8" });
        const parser = sax.createStream(true);

        let cpeItems = [];
        let currentItem = {};
        let currentElement = "";
        let referenceText = "";

        parser.on("opentag", (node) => {
            currentElement = node.name;

            if (node.name === "cpe-item") {
                currentItem = {
                    title: "",
                    cpe22Uri: node.attributes.name || null, 
                    cpe23Uri: null,
                    references: [],
                    deprecation22: formatDate(node.attributes.deprecation_date), // CPE-22 deprecation date
                    deprecation23: null,
                };
            }

            if (node.name === "cpe-23:cpe23-item") {
                currentItem.cpe23Uri = node.attributes.name || null;
            }

            if (node.name === "cpe-23:deprecation") {
                currentItem.deprecation23 = formatDate(node.attributes.date); 
            }

            if (node.name === "reference" && node.attributes.href) {
                currentItem.references.push(node.attributes.href); 
            }
        });

        parser.on("text", (text) => {
            text = text.trim();
            if (!text) return;

            if (currentElement === "title") {
                currentItem.title = text;
            } 
            // else if (currentElement === "reference") {
            //     referenceText += text; // Capture text inside <reference> tag
            // }
        });

        parser.on("closetag", (tagName) => {
            if (tagName === "reference" && referenceText) {
                currentItem.references.push(referenceText);
            }

            if (tagName === "cpe-item") {
                cpeItems.push({
                    title: currentItem.title || "Unknown Title",
                    cpe22Uri: currentItem.cpe22Uri || null,
                    cpe23Uri: currentItem.cpe23Uri || null,
                    references: JSON.stringify(currentItem.references || []), // Store as JSON array
                    deprecation22: currentItem.deprecation22 || null,
                    deprecation23: currentItem.deprecation23 || null,
                });

                if (cpeItems.length >= 1000) {
                    console.log(`🚀 Inserting batch of 1000 records...`);
                    insertCPEData(cpeItems);
                    cpeItems = [];
                }
            }
        });

        parser.on("end", async () => {
            console.log("🛑 XML Parsing completed!");

            if (cpeItems.length > 0) {
                console.log(`🚀 Inserting final batch of ${cpeItems.length} records...`);
                await insertCPEData(cpeItems);
            }

            console.log("✅ CPE data import completed successfully.");
            res.json({ message: "CPE data imported successfully" });
        });

        parser.on("error", (err) => {
            console.error("❌ XML Parsing Error:", err);
            res.status(500).json({ error: "Error parsing XML" });
        });

        stream.pipe(parser);
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function to format ISO 8601 timestamp to "YYYY-MM-DD"
function formatDate(isoDate) {
    if (!isoDate) return null;
    return isoDate.split("T")[0]; // Extracts "YYYY-MM-DD"
}

async function insertCPEData(data) {
    try {
        if (data.length === 0) {
            console.log("⚠️ No data to insert.");
            return;
        }

        const query = `
            INSERT INTO cpe_entries 
            (cpe_title, cpe_22_uri, cpe_23_uri, reference_links, cpe_22_deprecation_date, cpe_23_deprecation_date) 
            VALUES ?
        `;
        const values = data.map(item => [
            item.title, item.cpe22Uri, item.cpe23Uri, item.references, item.deprecation22, item.deprecation23
        ]);

        console.log("📌 Executing Query:", query);
        console.log("📌 Batch Size:", data.length);

        const [result] = await db.query(query, [values]);
        console.log(`✅ Batch insert successful. Inserted Rows: ${result.affectedRows}`);
    } catch (err) {
        console.error("❌ Database Insert Error:", err);
    }
}