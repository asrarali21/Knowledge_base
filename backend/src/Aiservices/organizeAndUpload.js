// scrapeAllPages.js

import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { load } from "cheerio";
import path from "path";
import dotenv from "dotenv";
import puppeteer from 'puppeteer';

dotenv.config({ path: '../../.env' })

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = "https://jntuh.ac.in/syllabus";
const BUCKET_NAME = "jntuh-documents";

async function uploadAndOrganizePdf(pdfUrl, bucketName, folderName) {
    try {
        const fileName = pdfUrl.split('/').pop().split('?')[0];
        const supabasePath = path.join('syllabus', folderName, fileName);
        console.log(`Processing for folder '${folderName}': ${fileName}`);
        
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const fileBody = response.data;
        
        const { data, error } = await supabase.storage.from(bucketName).upload(supabasePath, fileBody, {
            contentType: 'application/pdf',
            upsert: true,
        });
        
        if (error) throw new Error(`Supabase upload error: ${error.message}`);
        console.log(`✅ Uploaded to: ${supabasePath}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to process ${pdfUrl}:`, err.message);
        return false;
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeWithPuppeteer() {
    console.log('🚀 Starting Puppeteer-based scraping for all pages...');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Keep this false so you can see what's happening
        defaultViewport: null 
    });
    
    const page = await browser.newPage();
    
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        
        let allPdfLinks = [];
        let currentPage = 1;
        
        while (true) {
            console.log(`\n📄 Scraping page ${currentPage}...`);
            
            // Wait for table to load
            await page.waitForSelector('table tbody tr', { timeout: 10000 });
            
            // Get all PDF links on current page
            const currentPageLinks = await page.evaluate(() => {
                const rows = document.querySelectorAll('table tbody tr');
                const links = [];
                
                rows.forEach(row => {
                    const pdfLink = row.querySelector('a[href$=".pdf"]');
                    if (pdfLink) {
                        links.push({
                            text: pdfLink.textContent.trim(),
                            href: pdfLink.href
                        });
                    }
                });
                
                return links;
            });
            
            console.log(`   Found ${currentPageLinks.length} PDFs on page ${currentPage}`);
            allPdfLinks.push(...currentPageLinks);
            
            // Try to click on the next page number
            const nextPageExists = await page.evaluate((pageNum) => {
                // Look for the next page number link
                const nextPageNum = pageNum + 1;
                const allLinks = document.querySelectorAll('a');
                
                for (const link of allLinks) {
                    const linkText = link.textContent.trim();
                    const href = link.getAttribute('href');
                    
                    // Check if this is a page number link for the next page
                    if (linkText === nextPageNum.toString() && href && href.includes('fetch_list')) {
                        console.log(`Found page ${nextPageNum} link:`, href);
                        link.click();
                        return true;
                    }
                }
                
                return false;
            }, currentPage);
            
            if (!nextPageExists) {
                console.log(`📋 No page ${currentPage + 1} found. Finished scraping.`);
                break;
            }
            
            // Wait for new content to load after clicking
            await delay(3000);
            
            // Verify new content loaded by checking if PDF count changed
            const newPagePdfCount = await page.evaluate(() => {
                const rows = document.querySelectorAll('table tbody tr');
                let pdfCount = 0;
                rows.forEach(row => {
                    if (row.querySelector('a[href$=".pdf"]')) pdfCount++;
                });
                return pdfCount;
            });
            
            console.log(`   ✅ Page ${currentPage + 1} loaded with ${newPagePdfCount} PDFs`);
            
            currentPage++;
            
            // Safety limit to prevent infinite loops
            if (currentPage > 50) {
                console.log('🛑 Reached page limit of 50. Stopping.');
                break;
            }
        }
        
        console.log(`\n🎉 Total PDFs found across all pages: ${allPdfLinks.length}`);
        
        // Now process all the PDFs
        let successfulUploads = 0;
        
        for (let i = 0; i < allPdfLinks.length; i++) {
            const { text, href } = allPdfLinks[i];
            let folderName = 'other';
            
            console.log(`\n📄 Processing PDF ${i + 1}/${allPdfLinks.length}: ${text}`);
            
            // Determine folder based on content
            if (text.includes('B.Tech') || text.includes('B Tech')) folderName = 'btech';
            else if (text.includes('M.Tech') || text.includes('M Tech')) folderName = 'mtech';
            else if (text.includes('B.Pharm') || text.includes('B Pharm')) folderName = 'bpharm';
            else if (text.includes('M.Pharm') || text.includes('M Pharm')) folderName = 'mpharm';
            else if (text.includes('MBA')) folderName = 'mba';
            else if (text.includes('MCA')) folderName = 'mca';
            else if (text.includes('Ph.D') || text.includes('PhD')) folderName = 'phd';
            
            console.log(`📁 Target folder: ${folderName}`);
            console.log(`🔗 PDF URL: ${href}`);
            
            const success = await uploadAndOrganizePdf(href, BUCKET_NAME, folderName);
            if (success) successfulUploads++;
            
            // Small delay between uploads
            await delay(500);
        }
        
        console.log(`\n✨ All processing complete!`);
        console.log(`📊 Total PDFs found: ${allPdfLinks.length}`);
        console.log(`📊 Successful uploads: ${successfulUploads}`);
        console.log(`📊 Failed uploads: ${allPdfLinks.length - successfulUploads}`);
        
    } catch (error) {
        console.error('❌ Error during scraping:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the enhanced scraper
scrapeWithPuppeteer();