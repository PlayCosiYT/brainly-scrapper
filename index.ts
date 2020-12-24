import puppeter from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

import { Browser, Page } from "puppeteer-extra/dist/puppeteer";
import fs from "fs";

import crypto from "crypto";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

console.log("Modules Loaded!");

puppeter.use(stealthPlugin());

async function Run() {
    let userQuestion = prompt("What is your Question?");
    let Browser = await puppeter.launch({ headless: true });

    console.log("Browser ready!");
    let page = await Browser.newPage();

    let userSLicedAuestion = userQuestion.split(" ");
    await page.goto("https://brainly.in/app/ask?entry=hero&q=" + userSLicedAuestion.join("+"), { waitUntil: "networkidle2" });
    console.log(`Checking Brainly answers for question ${userQuestion}`);
    page.evaluate(() => {
        //@ts-ignore
        var x = document.querySelectorAll("a");
        x.forEach(links => {
            if (links.href.startsWith("https://brainly.in/question/2")) {
                links.click();
                return;
            }
        })
    });
    setTimeout(() => { AfterLink(page, Browser) }, 2000);
}

async function AfterLink(page: Page, Browser: Browser) {
    await page.evaluate(() => {
        let closeBTN = document.getElementsByClassName("sg-toplayer__close js-toplayer-close")
        //@ts-ignore 
        closeBTN[0].click();
    });

    let HtmlCodeOfTheAnswer = await page.evaluate(() => {
        let HTMLcode = null;
        let allDivs = (document.getElementsByTagName("div"));
        for (let index = 0; index < allDivs.length; index++) {
            const element = allDivs[index];
            if (element.className === "brn-qpage-next-answer-box-content") {
                HTMLcode = element;
            }
        }
        return HTMLcode?.innerHTML;
    });

    let randomFileName = crypto.randomBytes(14).toString("base64");
    let HTMLFIleToWrite = fs.createWriteStream(randomFileName + ".html");

    HTMLFIleToWrite.write(HtmlCodeOfTheAnswer);
    HTMLFIleToWrite.end();
    await page.screenshot({ path: "question.png" });
    console.log("Question at question.png");
    console.log(`Saved Answer to ${randomFileName}.html`);
    Browser.close();

}

Run();