/*eslint-env browser */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/

const that = this;

that.scrape = {
    parsedInput: {
        origin: null,
        host: null,
        href: null,
        hostname: null,
        pathname: null,
        port: null,
        protocol: null,
        search: null,
        hash: null,
        xpathLinks: null,
        xpathStory: null,
        name: null,
        hrefEmptyChapter: null,
        storyId: null,
        storyName: null
    },
    yqlGetChapterLinks: null,
    chapterLinksList: [],
    totalOfChapters: 0,
    currentChapter: 0
}
that.tempChapter = {};
that.sidebarMenu = {};
that.chapterObject = {
    storyChapterId: null,
    storyName: null,
    totalOfChapters: null,
    chapterUrl: null,
    storyContent: null
};
that.chaptersArray = [];
that.storyInfo = {

};
let Story = {};

        //HTML hooks
const btnScrape = document.querySelector("#btn-scrape");
const btnScrapeAndDrive = document.querySelector("#btn-scrape-drive");
const btnRestore = document.querySelector("#btn-restore");
const inputScrape = document.querySelector("#input-scrape");
const resultsAnchor = document.querySelector("#resultsAnchor");
const nextChapterLink = document.querySelector(".next");
const previousChapterLink = document.querySelector(".prev");
const chaptersTotal = document.querySelector("#chapters-total");
const chaptersSelect = document.querySelector("#chapters-select");
const mobileNav = document.querySelector("#mobile-nav");
const homebtn = document.querySelector(".home-btn");
const aboutbtn = document.querySelector(".about-btn");

        //IndexedDb
const DB_NAME = "offread";
const DB_VERSION = 6; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = "stories";
let db;
// Used to keep track of which view is displayed to avoid uselessly reloading it
let current_view_pub_key;

        //Google Auth
const CLIENT_ID = "698825936465-j1cs44897v5flnfrf7fpppnukp6okpq7.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive";
let id = null;
let idOff = null;
let globalAppFolderGoogleId = null;
let globalStoryFolderGoogleId = null;
let idStory = undefined;
let storyName = undefined;
that.driveItems = [];

const supportedSites = new Map([
    ["www.fanfiction.net", {
        xpathLinks: '//*[@id="chap_select"]',
        xpathStory: '//*[@id="storytext"]',
        jsonNChapters: ".query.results.select[0].option.length"
    }],
    ["m.fanfiction.net", {
        xpathLinks: '//*[@id="jump"]',
        xpathStory: '//*[@id="storytext"]',
        jsonNChapters: ".query.results.select[0].option.length"
    }],
    ["www.fictionpress.com", {
        xpathLinks: '//*[@id="chap_select"]',
        xpathStory: '//*[@id="storytext"]',
        jsonNChapters: ".query.results.select[0].option.length"
    }],
    ["m.fictionpress.com", {
        xpathLinks: '//*[@id="d_menu"]/div/form',
        xpathStory: '//*[@id="storytext"]',
        jsonNChapters: ".query.results.select[0].option.length"
    }]
]);

function makeRequest(data) {
    if (!data) return;
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        console.log(`making request with url: ${data.url}`);
        xhr.open(data.method, data.url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            //retry to download could enter here before rejecting
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
};