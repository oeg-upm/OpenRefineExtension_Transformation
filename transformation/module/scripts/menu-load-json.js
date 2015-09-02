// Internationalization init
var lang = navigator.language.split("-")[0]
		|| navigator.userLanguage.split("-")[0];
var dictionary = "";
$.ajax({
	url : "/command/core/load-language?",
	type : "POST",
	async : false,
	data : {
	  module : "transformation",
//		lang : lang
	},
	success : function(data) {
		dictionary = data;
	}
});
$.i18n.setDictionary(dictionary);
// End internationalization

var TransformationExtension = {};
var projectName;

TransformationExtension.applyJSON = function(){
	new applyJSON();
};

function applyJSON(){
  
	var self = this;
	var dialog = $(DOM.loadHTML("transformation","scripts/menu-load-json.html"));
	this._elmts = DOM.bind(dialog);
	
	this._elmts.fileInputLabel.text($.i18n._('load-json')["name"]+":");
	this._elmts.nextButton.addClass('btn btn-success').html($.i18n._('exit-buttons')["apply"]);
	this._elmts.exitButton.addClass('btn').text($.i18n._('exit-buttons')["cancel"]);
	this._elmts.fileInput.attr("disabled",false);
	
	var frame = DialogSystem.createDialog();
	frame.width("500px");
	
	$('<div></div>').addClass("dialog-header").text($.i18n._('t-menu')["apply-json-hd"]).appendTo(frame);
	  
	dialog.appendTo(frame);

	self._level = DialogSystem.showDialog(frame);

  this._elmts.nextButton.click(function(evt) {

    projectName = $.trim($("#file_name").val());
    
	  if (projectName.length === 0) {
	    window.alert($.i18n._('load-json')["proj-warning"]);
	  } else if(self._elmts.fileInput[0].files.length === 0) {
      window.alert($.i18n._('load-json')["file-invalid"]);
    } else {
      self.startImportJob(self._elmts.form);
    }
  });
  
  this._elmts.exitButton.click(function() {
    DialogSystem.dismissUntil(self._level - 1);
  });
}

applyJSON.prototype.startImportJob = function(form, callback) {
  var self = this;
  $.post(
      "command/core/create-importing-job",
      null,
      function(data) {
        var jobID = self._jobID = data.jobID;
        form.attr("method", "post")
        .attr("enctype", "multipart/form-data")
        .attr("accept-charset", "UTF-8")
        .attr("target", "create-project-iframe")
        .attr("action", "command/core/importing-controller?" + $.param({
          "controller": "core/default-importing-controller",
          "jobID": jobID,
          "subCommand": "load-raw-data"
        }));
        form[0].submit();
        
        var start = new Date();
        var timerID = window.setInterval(
          function() {
            self.pollImportJob(
              start, jobID, timerID,
              function(job) {
                return job.config.hasData;
              },
              function(jobID, job) {
                self._job = job;
                self.formatParser(jobID, job);
                if (callback) {
                  callback(jobID);
                }
              },
              function(job) {
                alert("Error: "+job.config.error + '\n' + job.config.errorDetails);
              }
            );
          },
          1000
        );
      },
      "json"
  );
};

applyJSON.prototype.formatParser = function(jobID, job) {
  var self = this;
  var format = "text/line-based/*sv";

  if (!(this._parserOptions)) { this._parserOptions = {}; }

  if (!(format in this._parserOptions)) {

    $.post(
      "command/core/importing-controller?" + $.param({
        "controller": "core/default-importing-controller",
        "jobID": jobID,
        "subCommand": "initialize-parser-ui",
        "format": format
      }),
      null,
    function(o) {
      if (o.status == 'error') {
        alert("error (formatParser): "+o.message);
        if (o.message) {
          alert("error (formatParser): "+o.message);
        } else {
          var messages = [];
          $.each(o.errors, function() { messages.push(this.message); });
          alert(messages.join('\n\n'));
        }
      } else {
        self._parserOptions[format] = o.options;
        self.updateFormat(jobID, job);
      }
    },
      "json"
    );
}else{
  self.updateFormat();
  
}};

applyJSON.prototype.updateFormat = function(jobID, job) {
  var self = this;
  var options = self.getOptions();
  var format = "text/line-based/*sv";
  this._format = format;
  
  $.post(
    "command/core/importing-controller?" + $.param({
      "controller": "core/default-importing-controller",
      "jobID": this._jobID,
      "subCommand": "update-format-and-options"
    }),
    {
      "format" : this._format,
      "options" : JSON.stringify(options)
    },
    function(o) {
      if (o.status == 'error') {
        if (o.message) {
          alert("error (updateFormat): "+o.message);
        } else {
          var messages = [];
          $.each(o.errors, function() { messages.push(this.message); });
          alert(messages.join('\n\n'));
        }
      } else {
        self.createProject(jobID, job);
      }
    },
    "json"
  );
}



applyJSON.prototype.pollImportJob = function(start, jobID, timerID, checkDone, callback, onError) {
  var self = this;
  $.post(
    "command/core/get-importing-job-status?" + $.param({ "jobID": jobID }),
    null,
    function(data) {
      var job = data.job;

      if (!(data)) {
        self.showImportJobError("Unknown error");
        window.clearInterval(timerID);
        return;
      } else if (data.code == "error" || !("job" in data)) {
        self.showImportJobError(data.message || "Unknown error");
        window.clearInterval(timerID);
        return;
      }
      if (job.config.state == "error") {
        window.clearInterval(timerID);
        onError(job);
      } else if (checkDone(job)) {
        
        window.clearInterval(timerID);
        if (callback) {
          callback(jobID, job);
        }
      } 
    },
    "json"
  );
};

applyJSON.prototype.cancelImportingJob = function(jobID) {
  $.post("command/core/cancel-importing-job?" + $.param({ "jobID": jobID }));
};

applyJSON.prototype.createProject = function(jobID, job) {
    var self = this;
    var project_Name = projectName;
    var options = self.getOptions();
    options.projectName = project_Name;
    var format = "text/line-based/*sv";
    
    $.post(
      "command/core/importing-controller?" + $.param({
        "controller": "core/default-importing-controller",
        "jobID": jobID,//this._jobID,
        "subCommand": "create-project"
      }),
      {
        "format" : format,
        "options" : JSON.stringify(options)
      },
      function(o) {
        if (o.status == 'error') {
          alert("Error : "+o.message);
          return;
        }
        
        
        var start = new Date();
        var timerID = window.setInterval(
          function() {
            self.pollImportJob(
                start,
                self._jobID,
                timerID,
                function(job) {
                  return "projectID" in job.config;
                },
                function(jobID, job) {
                  self.cancelImportingJob(jobID);
                  self.extractOperations(jobID, job.config.projectID);
                },
                function(job) {
                  alert("Error on create Project");
                }
            );
          },
          1000
        );
        
        
      },
      "json"
    );
};

applyJSON.prototype.getOptions = function() {
  var options = {
    encoding: ""
  };
  options.separator = ",";
  options.ignoreLines = -1;
  options.headerLines = 1;
  options.skipDataLines = 0;
  options.limit = -1;
  options.storeBlankRows = true;
  options.guessCellValueTypes = false;
  options.processQuotes = true;
  options.storeBlankCellsAsNulls = true;
  options.includeFileSources = false;
  
  return options;
};

applyJSON.prototype.extractOperations = function(jobID, projectID) {
  var self = this;
  var result;
  $.getJSON(
      "command/core/get-operations?" + $.param({ project: theProject.id }), 
      null,
      
      function(json) {
        if ("entries" in json) {
    var a = [];
    for (var i = 0; i < json.entries.length; i++) {
      var entry = json.entries[i];
      if ("operation" in entry) {
        a.push(entry.operation);
      }}
          result = JSON.stringify(a, null, 2);
          self.showApplyOperationsDialog(jobID, projectID, result);
      }
      },
      "jsonp"
  );
  
  DialogSystem.dismissUntil(self._level - 1);
};

applyJSON.prototype.showApplyOperationsDialog = function(jobID, projectID, json) {
  
  var fixJson = function(json) {
    json = json.trim();
    if (!json.startsWith("[")) {
      json = "[" + json;
    }
    if (!json.endsWith("]")) {
      json = json + "]";
    }

    return json.replace(/\}\s*\,\s*\]/g, "} ]").replace(/\}\s*\{/g, "}, {");
  };
  
    try {
      json = fixJson(json);
      json = JSON.parse(json);
      
    } catch (e) {
      alert("invalid JSON");
      //alert($.i18n._('core-project')["json-invalid"]+".");
      return;
    }

        $.post(
          "command/core/apply-operations?" + $.param({ project: projectID }), 
          { operations: JSON.stringify(json) },
          function(o) {
            if (o.status == 'error') {
              alert("Error (showApplyOperationsDialog): "+o.message);
              return;
            }
//var name = $.trim(theProject.metadata.name.replace(/\W/g, ' ')).replace(/\s+/g, '-');
var form = document.createElement("form");

  $(form)
  .css("display", "none")
  .attr("method", "post")
  .attr("action", "command/core/export-rows/" + projectName + "." + "csv")
  .attr("target", "refine-export");
  
  $('<input />')
  .attr("name", "project")
  .attr("value", projectID)
  .appendTo(form);
  $('<input />')
  .attr("name", "format")
  .attr("value", "csv")
  .appendTo(form);
    $('<input />')
    .attr("name", "engine")
    .attr("value", JSON.stringify(ui.browsingEngine.getJSON()))
    .appendTo(form);
  $('<input />')
  .attr("name", "contentType")
  .attr("value", "application/x-unknown") // force download
  .appendTo(form);
  
  document.body.appendChild(form);

  window.open("about:blank", "refine-export");
  form.submit();

  document.body.removeChild(form);
          },
            "text"
         );
};

ExtensionBar.addExtensionMenu(
  {
  "id":"transformation",
  "label": "Transformation",
  "submenu" : [
    {
      "id": "t/apply-json",
      label: $.i18n._('t-menu')["apply-json-menu"],
      click: function() { TransformationExtension.applyJSON(); }  
    },
    {},
    {
      "id": "t/load-ckan",
      label: $.i18n._('t-menu')["load-ckan"],
      click: function() { CKANUploadExtension.loadCKAN(); }
    },
    {
      "id": "t/extract-ckan",
      label: $.i18n._('t-menu')["extract-ckan"],
      //click: 
    }
  ]
  }
);