const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

const PORT = 3000;

const scrapeSite = async (vin) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(`https://catcar.info/bmw/?lang=en&vin=${vin}`);
    
    const tableData = await page.evaluate(() => {
      const table = document.querySelector('.table');
      const ths = Array.from(table.querySelectorAll('th'));
      const headers = ths.map(th => th.textContent.trim());
      
      const tr = table.querySelector('tr:nth-child(2)');
      const tds = Array.from(tr.querySelectorAll('td'));
      const rowData = tds.map(td => td.textContent.trim());
      
      const jsonData = {};
      headers.forEach((header, index) => {
        jsonData[header] = rowData[index];
      });
  
      return jsonData;
    });
  
    await browser.close();
  
    return tableData;
  };


  app.get('/get_data', async (req, res) => {
    const vin = req.query.vin;
    if (!vin) {
      return res.status(400).json({ error: "Please provide a VIN number" });
    }
  
    try {
      const data = await scrapeSite(vin);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
