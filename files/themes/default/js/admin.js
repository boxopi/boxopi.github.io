/*
	bof_AdminIndex(oOptions)
	{
		public init()
		public loadAdminIndex()
		public setAnnouncements()
		public showCurrentVersion()
		public checkUpdateAvailable()
	}

	bof_ViewVersions(oOptions)
	{
		public init()
		public loadViewVersions
		public swapOption(oSendingElement, sName)
		public compareVersions(sCurrent, sTarget)
		public determineVersions()
	}
*/



// Handle the JavaScript surrounding the admin and moderation center.
function bof_AdminIndex(oOptions)
{
	this.opt = oOptions;
	this.init();
}

bof_AdminIndex.prototype.init = function ()
{
	window.adminIndexInstanceRef = this;
	var fHandlePageLoaded = function () {
		window.adminIndexInstanceRef.loadAdminIndex();
	}
	addLoadEvent(fHandlePageLoaded);
}

bof_AdminIndex.prototype.loadAdminIndex = function ()
{
	// Load the text box containing the latest news items.
	if (this.opt.bLoadAnnouncements)
		this.setAnnouncements();

	// Load the current SMF and your SMF version numbers.
	if (this.opt.bLoadVersions)
		this.showCurrentVersion();

	// Load the text box that sais there's a new version available.
	if (this.opt.bLoadUpdateNotification)
		this.checkUpdateAvailable();
}


bof_AdminIndex.prototype.setAnnouncements = function ()
{
	if (!('bofAnnouncements' in window) || !('length' in window.bofAnnouncements))
		return;

	var sMessages = '';
	for (var i = 0; i < window.bofAnnouncements.length; i++)
		sMessages += this.opt.sAnnouncementMessageTemplate.replace('%href%', window.bofAnnouncements[i].href).replace('%subject%', window.bofAnnouncements[i].subject).replace('%time%', window.bofAnnouncements[i].time).replace('%message%', window.bofAnnouncements[i].message);

	setInnerHTML(document.getElementById(this.opt.sAnnouncementContainerId), this.opt.sAnnouncementTemplate.replace('%content%', sMessages));
}

bof_AdminIndex.prototype.showCurrentVersion = function ()
{
	if (!('bofVersion' in window))
		return;

	var oSmfVersionContainer = document.getElementById(this.opt.sSmfVersionContainerId);
	var oYourVersionContainer = document.getElementById(this.opt.sYourVersionContainerId);

	setInnerHTML(oSmfVersionContainer, window.bofVersion);

	var sCurrentVersion = getInnerHTML(oYourVersionContainer);
	if (sCurrentVersion != window.bofVersion)
		setInnerHTML(oYourVersionContainer, this.opt.sVersionOutdatedTemplate.replace('%currentVersion%', sCurrentVersion));
}

bof_AdminIndex.prototype.checkUpdateAvailable = function ()
{
	if (!('bofUpdatePackage' in window))
		return;

	var oContainer = document.getElementById(this.opt.sUpdateNotificationContainerId);

	// Are we setting a custom title and message?
	var sTitle = 'bofUpdateTitle' in window ? window.bofUpdateTitle : this.opt.sUpdateNotificationDefaultTitle;
	var sMessage = 'bofUpdateNotice' in window ? window.bofUpdateNotice : this.opt.sUpdateNotificationDefaultMessage;

	setInnerHTML(oContainer, this.opt.sUpdateNotificationTemplate.replace('%title%', sTitle).replace('%message%', sMessage));

	// Parse in the package download URL if it exists in the string.
	document.getElementById('update-link').href = this.opt.sUpdateNotificationLink.replace('%package%', window.bofUpdatePackage);

	// If we decide to override life into "red" mode, do it.
	if ('bofUpdateCritical' in window)
	{
		document.getElementById('update_table').style.backgroundColor = '#aa2222';
		document.getElementById('update_title').style.backgroundColor = '#dd2222';
		document.getElementById('update_title').style.color = 'white';
		document.getElementById('update_message').style.backgroundColor = '#eebbbb';
		document.getElementById('update_message').style.color = 'black';
	}
}



function bof_ViewVersions (oOptions)
{
	this.opt = oOptions;
	this.oSwaps = {};
	this.init();
}

bof_ViewVersions.prototype.init = function ()
{
	// Load this on loading of the page.
	window.viewVersionsInstanceRef = this;
	var fHandlePageLoaded = function () {
		window.viewVersionsInstanceRef.loadViewVersions();
	}
	addLoadEvent(fHandlePageLoaded);
}

bof_ViewVersions.prototype.loadViewVersions = function ()
{
	this.determineVersions();
}

bof_ViewVersions.prototype.swapOption = function (oSendingElement, sName)
{
	// If it is undefined, or currently off, turn it on - otherwise off.
	this.oSwaps[sName] = !(sName in this.oSwaps) || !this.oSwaps[sName];
	document.getElementById(sName).style.display = this.oSwaps[sName] ? '' : 'none';

	// Unselect the link and return false.
	oSendingElement.blur();
	return false;
}

bof_ViewVersions.prototype.compareVersions = function (sCurrent, sTarget)
{
	var aVersions = aParts = new Array();
	var aCompare = new Array(sCurrent, sTarget);

	for (var i = 0; i < 2; i++)
	{
		// Clean the version and extract the version parts.
		var sClean = aCompare[i].toLowerCase().replace(/ /g, '').replace(/2.0rc1-1/, '2.0rc1.1');
		aParts = sClean.match(/(\d+)(?:\.(\d+|))?(?:\.)?(\d+|)(?:(alpha|beta|rc)(\d+|)(?:\.)?(\d+|))?(?:(dev))?(\d+|)/);

		// No matches?
		if (aParts == null)
			return false;

		// Build an array of parts.
		aVersions[i] = [
			aParts[1] > 0 ? parseInt(aParts[1]) : 0,
			aParts[2] > 0 ? parseInt(aParts[2]) : 0,
			aParts[3] > 0 ? parseInt(aParts[3]) : 0,
			typeof(aParts[4]) == 'undefined' ? 'stable' : aParts[4],
			aParts[5] > 0 ? parseInt(aParts[5]) : 0,
			aParts[6] > 0 ? parseInt(aParts[6]) : 0,
			typeof(aParts[7]) != 'undefined',
		];
	}

	// Loop through each category.
	for (i = 0; i < 7; i++)
	{
		// Is there something for us to calculate?
		if (aVersions[0][i] != aVersions[1][i])
		{
			// Dev builds are a problematic exception.
			// (stable) dev < (stable) but (unstable) dev = (unstable)
			if (i == 3)
				return aVersions[0][i] < aVersions[1][i] ? !aVersions[1][6] : aVersions[0][6];
			else if (i == 6)
				return aVersions[0][6] ? aVersions[1][3] == 'stable' : false;
			// Otherwise a simple comparison.
			else
				return aVersions[0][i] < aVersions[1][i];
		}
	}

	// They are the same!
	return false;
}

bof_ViewVersions.prototype.determineVersions = function ()
{
	var oHighYour = {
		Sources: '??',
		Default: '??',
		Languages: '??',
		Templates: '??'
	};
	var oHighCurrent = {
		Sources: '??',
		Default: '??',
		Languages: '??',
		Templates: '??'
	};
	var oLowVersion = {
		Sources: false,
		Default: false,
		Languages: false,
		Templates: false
	};

	var sSections = [
		'Sources',
		'Default',
		'Languages',
		'Templates'
	];

	for (var i = 0, n = sSections.length; i < n; i++)
	{
		// Collapse all sections.
		var oSection = document.getElementById(sSections[i]);
		if (typeof(oSection) == 'object' && oSection != null)
			oSection.style.display = 'none';

		// Make all section links clickable.
		var oSectionLink = document.getElementById(sSections[i] + '-link');
		if (typeof(oSectionLink) == 'object' && oSectionLink != null)
		{
			oSectionLink.instanceRef = this;
			oSectionLink.sSection = sSections[i];
			oSectionLink.onclick = function () {
				this.instanceRef.swapOption(this, this.sSection);
				return false;
			};
		}
	}

	if (!('bofVersions' in window))
		window.bofVersions = {};

	for (var sFilename in window.bofVersions)
	{
		if (!document.getElementById('current' + sFilename))
			continue;

		var sYourVersion = getInnerHTML(document.getElementById('your' + sFilename));

		var sCurVersionType;
		for (var sVersionType in oLowVersion)
			if (sFilename.substr(0, sVersionType.length) == sVersionType)
			{
				sCurVersionType = sVersionType;
				break;
			}

		if (typeof(sCurVersionType) != 'undefined')
		{
			if ((this.compareVersions(oHighYour[sCurVersionType], sYourVersion) || oHighYour[sCurVersionType] == '??') && !oLowVersion[sCurVersionType])
				oHighYour[sCurVersionType] = sYourVersion;
			if (this.compareVersions(oHighCurrent[sCurVersionType], bofVersions[sFilename]) || oHighCurrent[sCurVersionType] == '??')
				oHighCurrent[sCurVersionType] = bofVersions[sFilename];

			if (this.compareVersions(sYourVersion, bofVersions[sFilename]))
			{
				oLowVersion[sCurVersionType] = sYourVersion;
				document.getElementById('your' + sFilename).style.color = 'red';
			}
		}
		else if (this.compareVersions(sYourVersion, bofVersions[sFilename]))
			oLowVersion[sCurVersionType] = sYourVersion;

		setInnerHTML(document.getElementById('current' + sFilename), bofVersions[sFilename]);
		setInnerHTML(document.getElementById('your' + sFilename), sYourVersion);
	}

	if (!('bofLanguageVersions' in window))
		window.bofLanguageVersions = {};

	for (sFilename in window.bofLanguageVersions)
	{
		for (var i = 0; i < this.opt.aKnownLanguages.length; i++)
		{
			if (!document.getElementById('current' + sFilename + this.opt.aKnownLanguages[i]))
				continue;

			setInnerHTML(document.getElementById('current' + sFilename + this.opt.aKnownLanguages[i]), bofLanguageVersions[sFilename]);

			sYourVersion = getInnerHTML(document.getElementById('your' + sFilename + this.opt.aKnownLanguages[i]));
			setInnerHTML(document.getElementById('your' + sFilename + this.opt.aKnownLanguages[i]), sYourVersion);

			if ((this.compareVersions(oHighYour.Languages, sYourVersion) || oHighYour.Languages == '??') && !oLowVersion.Languages)
				oHighYour.Languages = sYourVersion;
			if (this.compareVersions(oHighCurrent.Languages, bofLanguageVersions[sFilename]) || oHighCurrent.Languages == '??')
				oHighCurrent.Languages = bofLanguageVersions[sFilename];

			if (this.compareVersions(sYourVersion, bofLanguageVersions[sFilename]))
			{
				oLowVersion.Languages = sYourVersion;
				document.getElementById('your' + sFilename + this.opt.aKnownLanguages[i]).style.color = 'red';
			}
		}
	}

	setInnerHTML(document.getElementById('yourSources'), oLowVersion.Sources ? oLowVersion.Sources : oHighYour.Sources);
	setInnerHTML(document.getElementById('currentSources'), oHighCurrent.Sources);
	if (oLowVersion.Sources)
		document.getElementById('yourSources').style.color = 'red';

	setInnerHTML(document.getElementById('yourDefault'), oLowVersion.Default ? oLowVersion.Default : oHighYour.Default);
	setInnerHTML(document.getElementById('currentDefault'), oHighCurrent.Default);
	if (oLowVersion.Default)
		document.getElementById('yourDefault').style.color = 'red';

	if (document.getElementById('Templates'))
	{
		setInnerHTML(document.getElementById('yourTemplates'), oLowVersion.Templates ? oLowVersion.Templates : oHighYour.Templates);
		setInnerHTML(document.getElementById('currentTemplates'), oHighCurrent.Templates);

		if (oLowVersion.Templates)
			document.getElementById('yourTemplates').style.color = 'red';
	}

	setInnerHTML(document.getElementById('yourLanguages'), oLowVersion.Languages ? oLowVersion.Languages : oHighYour.Languages);
	setInnerHTML(document.getElementById('currentLanguages'), oHighCurrent.Languages);
	if (oLowVersion.Languages)
		document.getElementById('yourLanguages').style.color = 'red';
}