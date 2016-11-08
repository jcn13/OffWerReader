/*eslint-env browser */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/


const StartGoogleDrive = function () {
    const promise = new Promise((resolve, reject) => {
        console.log("StartGoogleDrive started");
        var script = document.createElement('script'),
            loaded;
        script.setAttribute('src', "https://apis.google.com/js/client.js");

        script.onreadystatechange = script.onload = function () {
            if (!loaded) {
                setTimeout(function () { resolve(); }, 600);
            };
            loaded = true;
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    });
    return promise;
};

function checkAuthImmediate() {
    return new Promise((resolve, reject) => {
        gapi.auth.authorize(
                { 'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true },
                undefined)
            .then((response) => {
                console.log("checkAuth");
                resolve(handleAuthResult(response));
            });
    });
};

function checkAuthNoImmediate() {
    return new Promise((resolve, reject) => {
        gapi.auth.authorize(
                { 'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false },
                undefined)
            .then((response) => {
                console.log("checkAuth");
                resolve(handleAuthResult(response));
            });
    });
};
function loadDriveApi() {
    const promise = new Promise((resolve, reject) => {
        gapi.client.load("drive", "v2", undefined).then((response) => {
            console.log("loadDriveApi");
            resolve(response);
        });
    });
    return promise;
}

function handleAuthResult(authResult) {
    const promise = new Promise((resolve, reject) => {
        const authButton = document.getElementById("authorizeButton");
        authButton.style.display = "none";
        if (authResult && !authResult.error) {
            // Access token has been successfully retrieved, requests can be sent to the API.
            console.log("authResult success");
            authButton.style.display = "none";
            loadDriveApi().then((response) => { resolve(response) });
        } else {
            // No access token could be retrieved, show the button to start the authorization flow.
            console.log("authResult need authorization click");
            authButton.style.display = "block";
            authButton.onclick = () => {
                checkAuthNoImmediate();
            };
        };
    });
    return promise;
}

function uploadFile(evt) {
    const promise = new Promise((resolve, reject) => {
        gapi.client.load("drive",
            "v2",
            () => {
                resolve();
            },
            () => {
                reject();
            });
    });
    return promise;
}
const uploadAllStoryChapters = (data) => {
    const promise = new Promise((resolve, reject) => {
        console.log("uploadAllStoryChapters, data", that.chaptersArray);
        return that.chaptersArray.map((response, i) => {
            return uploadChapter(that.chaptersArray[i], globalStoryFolderGoogleId)
                .then((response) => {
                    resolve();
                });
        });
    });
    return promise;
};
function uploadChapter(chapterObject, storyFolderGoogleId) {
    const promise = new Promise((resolve, reject) => {
        if (!chapterObject) {
            console.log("uploadChapterHelper !chapterObject", chapterObject);
        }
        if (!storyFolderGoogleId) {
            console.log("uploadChapterHelper !storyFolderGoogleId", storyFolderGoogleId);
        }
        const boundary = "-------314159265358979323846264";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const contentType = "application/json";
        const metadata = {
            'title': chapterObject.storyChapterId,
            'mimeType': contentType,
            "parents": [{ "id": storyFolderGoogleId }]
        };
        const obj = (JSON.stringify(chapterObject));
        const multipartRequestBody =
            delimiter +
                "Content-Type: application/json\r\n\r\n" +
                JSON.stringify(metadata) +
                delimiter +
                "Content-Type: " +
                contentType +
                "\r\n\r\n" +
                obj +
                close_delim;
        const request = gapi.client.request({
            'path': "/upload/drive/v2/files",
            'method': "POST",
            'params': { 'uploadType': "multipart" },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        request.execute(function (arg) {
            console.log("uploadChapterHelper, arg: ", arg);
            resolve();
        });
    });
    return promise;
}

function deleteFolderById(id) {
    const promise = new Promise((resolve, reject) => {
        console.log("DELETAR");
        gapi.client.drive.files.delete({
            'fileId': id
        }).execute((resp) => {
            console.log(resp);
            resolve();
        });
    });
    return promise;
};

function createStoryFolderAsync(resp) {
    const promise = new Promise((resolve, reject) => {
        console.log("folderName: ", that.scrape.parsedInput.storyName);
        gapi.client.drive.files.list(
            {
                'q': "mimeType = 'application/vnd.google-apps.folder' and title = '" + that.scrape.parsedInput.storyId + "' and trashed = false"
            }).then((response) => {
                console.log("createStoryFolderAsync", response);
                if (response.result.items.length !== 0) {
                    deleteFolderById(response.result.items[0].id)
                        .then(() => {
                            resolve(createStoryFolderAsyncHelper());
                        });
                } else {
                    resolve(createStoryFolderAsyncHelper());
                }
            });
    });
    return promise;
};

function createStoryFolderAsyncHelper(resp) {
    const promise = new Promise((resolve, reject) => {
        const data = new Object();
        data.title = that.scrape.parsedInput.storyId;
        data.parents = [{ "id": globalAppFolderGoogleId }];
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.insert({ 'resource': data }).execute((fileList) => {
            globalStoryFolderGoogleId = fileList.id;
            console.log(fileList);
            resolve();
        });
    });
    return promise;
};

function createAppFolderAsync(resp) {
    const promise = new Promise((resolve, reject) => {
        console.log("test: ", gapi.client.drive);
        gapi.client.drive.files.list(
            {
                'q': "mimeType = 'application/vnd.google-apps.folder' and title = 'OffWebReader' and trashed = false"
            }).then((response) => {
                console.log("createAppFolderAsync, response: ", response);
                if (response.result.items.length === 0) {
                    console.log("CRIAR");
                    resolve(createAppFolderAsyncHelper());
                } else {
                    globalAppFolderGoogleId = response.result.items[0].id;
                    resolve();
                }
            });
    });
    return promise;
}
function createAppFolderAsyncHelper(resp) {
    const promise = new Promise((resolve, reject) => {
        const data = new Object();
        data.title = "OffWebReader";
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.insert({ 'resource': data }).execute((fileList) => {
            globalAppFolderGoogleId = fileList.id;
            console.log(fileList);
            resolve();
        });
    });
    return promise;
};

function restoreFromGoogle() {
    const promise = new Promise((resolve, reject) => {
        var request = gapi.client.drive.files.list(
        {
            'q': "mimeType = 'application/json' and '"+globalAppFolderGoogleId+"' in parents  and trashed = false"
        });
        request.execute(function (resp) {
            console.log("restoreFromGoogle, id: ", globalAppFolderGoogleId);
            var files = resp.items;
            console.log("restoreFromGoogle, files: ", files);
            resolve(downloadFiles(files));
        });
    });
    return promise;
};
function downloadFiles(files) {
    const promise = new Promise((resolve, reject) => {
        return files.map((response, i) => {
            return makeRequestGoogleDrive(files[i].downloadUrl)
                .then((response) => {
                    console.log("downloadFiles.then, response: ", response);
                    //storyObj = {
                    //    storyChapterId: response.storyChapterId,
                    //    storyName: response.storyName,
                    //    totalOfChapters: response.totalOfChapters,
                    //    chapterUrl: response.chapterUrl,
                    //    storyContent: response.storyContent
                    //};
                    //console.log("storyObj: ", storyObj);
                    //return upsertChapter(response.storyChapterId, response.storyName, response.chapterUrl, response.storyContent, response.totalOfChapters);
                });
        });
        //if (file.downloadUrl) {
        //    var accessToken = gapi.auth.getToken().access_token;
        //    var xhr = new XMLHttpRequest();
        //    xhr.open('GET', file.downloadUrl);
        //    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        //    xhr.onload = function () {
        //        console.log('Data downloaded:');
        //        appState = JSON.parse(xhr.responseText);
        //        console.log(appState);
        //        addOrReplaceStory(appState.ChapterId, appState.StoryName, appState.Url, appState.Content, appState.NumberOfChapters);
        //    };
        //    xhr.onerror = function () {
        //        console.log('XHR error!');
        //        reject();
        //    };
        //    xhr.send();
        //} else {
        //    console.log('Can\'t download...');
        //}
    });
    return promise;
};
function makeRequestGoogleDrive(downloadUrl) {
    if (!downloadUrl) return;
    return new Promise(function (resolve, reject) {
        var accessToken = gapi.auth.getToken().access_token;
        const xhr = new XMLHttpRequest();
        console.log(`making request with url: ${downloadUrl}`);
        xhr.open('GET', downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                console.log(xhr);
                appState = JSON.parse(xhr.responseText);
                resolve(appState);
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
function downloadFile(file) {
    const promise = new Promise((resolve, reject) => {
        if (file.downloadUrl) {
            var accessToken = gapi.auth.getToken().access_token;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file.downloadUrl);
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.onload = function () {
                console.log('Data downloaded:');
                appState = JSON.parse(xhr.responseText);
                console.log(appState);
                addOrReplaceStory(appState.ChapterId, appState.StoryName, appState.Url, appState.Content, appState.NumberOfChapters);
            };
            xhr.onerror = function () {
                console.log('XHR error!');
                reject();
            };
            xhr.send();
        } else {
            console.log('Can\'t download...');
        }
    });
    return promise;
};