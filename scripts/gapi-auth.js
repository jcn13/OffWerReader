/*eslint-env browser */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/

      var CLIENT_ID = '698825936465-j1cs44897v5flnfrf7fpppnukp6okpq7.apps.googleusercontent.com';
      var SCOPES = 'https://www.googleapis.com/auth/drive';
      var id = null; 
      var idOff = null;      
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
          gapi.client.load('drive', 'v2', function() {listFilesFolder("OffWebReader");});;           
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
          listFilesFolder("OffWebReader", id, null);           
          //setTimeout(function(){ listFiles(storyName, "TesteMagico.4", appState); }, 4000);
          //setTimeout(function(){ deleteFile(idStory); }, 7000);                        
        });
      }
      /**
       * Insert new file.
       */
      function deleteFile(folderStory, callback) 
      {
        var request = gapi.client.drive.files.delete({
        'fileId': folderStory        
        });      
      request.execute(function(resp) { });      
      }
     function insertFile(name, id, obj) {        
        const boundary = '-------314159265358979323846264';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";        
        var fileName = name;
        var contentType = 'application/json';
        var parentId = id
        var metadata = {          
          'title': fileName,
          'mimeType': contentType,
          "parents": [{"id":parentId}]
        };
        var a = (JSON.stringify(obj));        
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            a +
            close_delim;
        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        request.execute(function(arg) {
          console.log(arg);
          fileId=arg.id;
          console.log(fileId);          
        });                          
      }      
    function createFolder(name, parent, callback)
    {
  	  var pai = parent;
      data = new Object();
      data.title = name;
      if(pai != undefined)
      {
          data.parents = [{"id":pai}];
      }
      data.mimeType = "application/vnd.google-apps.folder";                 
  		gapi.client.drive.files.insert({'resource': data}).execute(function(fileList)
      {
        if(name == "OffWebReader")
        {
          idOff = fileList.id;
          if (callback != null)
          {
            return callback(id);
          }                          
        }
        else
        {
          console.log(fileList);
          idStory = fileList.id;
          return callback(idStory); 
        }
      });         
      console.log("folder: " + name + " criado"); 
    }	   
     function listFilesFolder(folderName, parent, callback) 
   {
        var contentType = "application/vnd.google-apps.folder";
        var request = gapi.client.drive.files.list({
            //'parents': [{"isRoot":true}],
            'mimeType' : contentType
          });
          request.execute(function(resp)
          {
            count = 0;
            var files = resp.items;            
            if (files && files.length > 0) 
            {
              for (var i = 0; i < files.length; i++) 
              {
                file = files[i];                
                id = file.id;
                var title = file.title;                             
                console.log(id+" / "+title);                
                if(title == folderName)
                {                
                  count++;                  
                  if(folderName != "OffWebReader")
                  {
                    id = idStory;                          
                    return callback(idStory);                    
                  }
                  else
                  {
                    idOff = id;
                  }
                  return console.log("folder"+ folderName + " existe");                 
                }                                                
              }
            }
            if (count == 0)
            {
              createFolder(folderName, id, callback);              
              count++;                         
            }  
          });                                    
    }      