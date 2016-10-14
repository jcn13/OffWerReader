/*eslint-env browser */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/

  var CLIENT_ID = '698825936465-j1cs44897v5flnfrf7fpppnukp6okpq7.apps.googleusercontent.com';
  var SCOPES = 'https://www.googleapis.com/auth/drive';
  var id = null; 
  var idOff = null;   
  var globalAppFolderGoogleId = null;
  var globalStoryFolderGoogleId = null;   
  var idStory = undefined; 
  var storyName = undefined;          
  /**
   * Called when the client library is loaded to start the auth w.
   */
  function handleClientLoad() {
    window.setTimeout(checkAuth, 1);
  }
  /**
   * Check if the current user has authorized the application.
   */
  function checkAuth() {
    gapi.auth.authorize(
        {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
        handleAuthResult);
        
  }
  /**
   * Called when authorization server replies.
   *
   * @param {Object} authResult Authorization result.
   */
  function handleAuthResult(authResult) {
    var authButton = document.getElementById('authorizeButton');        
    authButton.style.display = 'none';        
    if (authResult && !authResult.error) {
      // Access token has been successfully retrieved, requests can be sent to the API.
      authButton.style.display = 'none';
      gapi.client.load('drive', 'v2', function() {createAppFolder();});;           
    } else {
      // No access token could be retrieved, show the button to start the authorization flow.
      authButton.style.display = 'block';
      authButton.onclick = function() {
          gapi.auth.authorize(
              {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
              handleAuthResult);
      };
    }
  }
  /**
   * Start the file upload.
   *
   * @param {Object} evt Arguments from the file selector.
   */
  function uploadFile(evt) {
    gapi.client.load('drive', 'v2', function() {
      //listFiles("OffWebReader", "TesteMagico.2", appState);
      
      //listFilesFolder("OffWebReader", id, null);           
      //setTimeout(function(){ listFiles(storyName, "TesteMagico.4", appState); }, 4000);
      //setTimeout(function(){ deleteFile(idStory); }, 7000);                        
    });
  }
  /**
   * Insert new file.
   */
function createAppFolder(){
      listFiles("OffWebReader", null, createAppFolderHelper);
    }

    function createStoryFolder(storyName){
      if(!storyName){
        console.log("createStoryFolder !storyName", storyName);
        return;
      }
      if(!globalAppFolderGoogleId){
        console.log("createStoryFolder !appFolderGoogleId", appFolderGoogleId);
        return;
      }
      listFiles(storyName, globalAppFolderGoogleId, createStoryFolderHelper);
    }

    function deleteStoryFolder(storyName){
      if(!storyName){
        console.log("deleteStoryFolder !storyName", storyName);
        return;
      }
      if(!globalAppFolderGoogleId){
        console.log("deleteStoryFolder !globalAppFolderGoogleId", globalAppFolderGoogleId);
        return;
      }
      listFiles(storyName, globalAppFolderGoogleId, deleteStoryFolderHelper);
    }

    function folderAddOrUpdate(files, name){
      if(!files){
        console.log("folderAddOrUpdate !files", files);
        return;
      }
      if(!name){
        console.log("folderAddOrUpdate !name", name);
        return;
      }
      for (let i = 0; i < files.length; i++) 
      {
        file = files[i];                 
        //console.log(id+" / "+title);                
        if(file.title === name)
        { 
          if(globalAppFolderGoogleId === null){
            globalAppFolderGoogleId = file.id;
          }
          else{
            globalStoryFolderGoogleId = file.id;
            const request = gapi.client.drive.files.delete({
                'fileId': globalStoryFolderGoogleId        
            });      
        request.execute(function(resp) { });
          }
          console.log("folder"+ name + " existe"); 
          return true;      
        }                                         
      } 
      return false;              
    }  

    function createAppFolderHelper(files, name, parent){
      if(!name){
        console.log("createAppFolderHelper !name", name);
        return;
      }
      if(folderAddOrUpdate(files, name)){
        return;
      }
      data = new Object();
      data.title = name;
      data.mimeType = "application/vnd.google-apps.folder";                 
      gapi.client.drive.files.insert({'resource': data}).execute(function(fileList)
      {
        globalAppFolderGoogleId = fileList.id;
        console.log(fileList);
      });
      console.log("appFolder: " + name + " criado"); 
    }

    function createStoryFolderHelper(files, storyName, parent){
      if(folderAddOrUpdate(files, storyName)){
        if(!globalStoryFolderGoogleId){
          console.log("globalStoryFolderGoogleId não encontrado", globalStoryFolderGoogleId);
          return;
        }       
      }
      if(!globalAppFolderGoogleId){
        console.log("globalAppFolderGoogleId não encontrado", globalAppFolderGoogleId);
        return;
      }
      data = new Object();
      data.title = storyName;
      data.parents = [{"id":globalAppFolderGoogleId}];
      data.mimeType = "application/vnd.google-apps.folder";                 
      gapi.client.drive.files.insert({'resource': data}).execute(function(fileList)
      {
          console.log("createStoryFolderHelper execute", fileList.id)
        globalStoryFolderGoogleId = fileList.id;
        console.log(fileList);
        populateChapters();
      });
      console.log("storyFolder: " + name + " criado"); 
    }

    function deleteStoryFolderHelper(files, storyName, ignore2){
      if(!globalStoryFolderGoogleId){
        console.log("deleteStoryFolderHelper !storyFolderGoogleId", storyFolderGoogleId);
      }
      folderAddOrUpdate(files, storyName);  
    }

    function uploadChapter(chapterObject, storyFolderGoogleId){
      if(!chapterObject){
        console.log("uploadChapterHelper !chapterObject", chapterObject);
      }
      if(!storyFolderGoogleId){
        console.log("uploadChapterHelper !storyFolderGoogleId", storyFolderGoogleId);
      }
      const boundary = '-------314159265358979323846264';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";  
        const contentType = 'application/json';
        const metadata = {          
          'title': chapterObject.ChapterId,
          'mimeType': contentType,
          "parents": [{"id":storyFolderGoogleId}]
        };
        const obj = (JSON.stringify(chapterObject));        
        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            obj +
            close_delim;
        const request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        request.execute(function(arg) {
          console.log("uploadChapterHelper, arg: ", arg);
        });
    }  

    function listFiles(folderName, parent, callback) 
    {
      if(!folderName){
        console.log("listFiles !folderName", folderName);
      }
      if(!parent){
        console.log("listFiles !parent", parent);
      }
      if(!callback){
        console.log("listFiles !callback", callback);
      }
      var request = gapi.client.drive.files.list(          
        {'q': "mimeType = 'application/vnd.google-apps.folder'"});
        request.execute(function(resp)
        {    
        var files = resp.items;            
        if (files && files.length > 0) 
        {           
          callback(files, folderName, parent); 
        }
        else
        {
          callback(null, "OffWebReader", undefined);
        }        
      });                                    
    }