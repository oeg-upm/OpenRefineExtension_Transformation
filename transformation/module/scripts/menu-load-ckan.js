/*
function loadCKANDialog(onDone) {
	this._onDone = onDone;
	this._params = {};
	var self = this;
	var dialog = $(DOM.loadHTML("transformation","scripts/menu-load-ckan.html"));
	this._elmts = DOM.bind(this._dialog);

	this._elmts.t_header.text($.i18n._('rdf-ext-virtuoso')["header"]);
	this._elmts.t_load_ckan_name.text($.i18n._('load-ckan')["sqlalchemy_url"]+":");

	this._elmts.okButton.html($.i18n._('exit-buttons')["ok"]);
	this._elmts.cancelButton.text($.i18n._('exit-buttons')["cancel"]);
	
	this._elmts.okButton.click(function() {
		DialogSystem.dismissUntil(self._level - 1);
	});

	this._elmts.cancelButton.click(function() {
		DialogSystem.dismissUntil(self._level - 1);
	});
	
	this._level = DialogSystem.showDialog(this._dialog);
	//dismissBusy();
}

loadCKANDialog.prototype.uploadData = function() {
	var self = this;
}
*/
var CKANUploadExtension = {};

CKANUploadExtension.loadCKAN = function(){
	new loadCKAN();
};

function loadCKAN(){
	var self = this;
	var dialog = $(DOM.loadHTML("transformation","scripts/menu-load-ckan.html"));
	this._elmts = DOM.bind(dialog);
	
  this._elmts.t_load_ckan_sqlalchemy_url.text($.i18n._('load-ckan')["sqlalchemy_url"]+":");
  this._elmts.t_load_ckan_ds_write_url.text($.i18n._('load-ckan')["ds_write_url"]+":");
  this._elmts.t_load_ckan_ds_read_url.text($.i18n._('load-ckan')["ds_read_url"]+":");
  this._elmts.t_load_ckan_solr_url.text($.i18n._('load-ckan')["solr_url"]+":");

  this._elmts.t_load_ckan_site_id.text($.i18n._('load-ckan')["site_id"]+":");
  this._elmts.t_load_ckan_site_url.text($.i18n._('load-ckan')["site_url"]+":");
  this._elmts.t_load_ckan_storage_path.text($.i18n._('load-ckan')["storage_path"]+":");
  this._elmts.t_load_ckan_data_pusher.text($.i18n._('load-ckan')["data_pusher"]+":");
  
  this._elmts.t_load_ckan_smtp_server.text($.i18n._('load-ckan')["smtp_server"]+":");
  this._elmts.t_load_ckan_smtp_starttls.text($.i18n._('load-ckan')["smtp_starttls"]+":");
  this._elmts.t_load_ckan_smtp_user.text($.i18n._('load-ckan')["smtp_user"]+":");
  this._elmts.t_load_ckan_smtp_password.text($.i18n._('load-ckan')["smtp_password"]+":");


	var frame = DialogSystem.createDialog();

	frame.width("500px");

	$('<div></div>').addClass("dialog-header").text($.i18n._('load-ckan')["ckan-load-hd"]).appendTo(frame);
	$('<div></div>').addClass("dialog-body").append(dialog).appendTo(frame);
	var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);

	this._level = DialogSystem.showDialog(frame);
	
	//this._footer(footer);
	//... to continue
	
	$('<button></button>').addClass('btn btn-success').html($.i18n._('exit-buttons')["ok"]).click(function() {
	//Apply function
	// JSON
	
	// continue...
	//
	}).appendTo(footer);
	
	$('<button></button>').addClass('btn').text($.i18n._('exit-buttons')["cancel"]).click(function() {
		DialogSystem.dismissUntil(self._level - 1);
	}).appendTo(footer);
};
