// helper function to produce a message to the user
function toast(message) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        type: "success",
        title: message
    });
}

/**
     * Creates an image to copy a value to the clipboard.
     * This value could is the metadata linked to the tag 'select' (metadata). metadata == '$' + name of tag 'select'
     *
     * @param {element} elem        Tag 'select'.
     */
function createCopyImg(elem) {
    var copyImg = document.createElement("img");
    copyImg.setAttribute('src', 'images/copy_icon.png');
    copyImg.setAttribute('class', 'copy');
    copyImg.setAttribute('title', 'Copy metavariable $' + elem.name);
    copyImg.onclick = function() { copyToClipboard('$' + elem.name); };
    return copyImg;
}

/**
     * Copies a string to the clipboard. Must be called from within an
     * event handler such as click. May return false if it failed, but
     * this is not always possible. Browser support for Chrome 43+,
     * Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
     * Internet Explorer: The clipboard feature may be disabled by
     * an administrator. By default a prompt is shown the first
     * time the clipboard is used (per session).
     */
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

/* 
    Return the french name of a country given as parameter (english name) 
    Used monstly on french SPARQL endpoints, such as HAL
*/
function getFrenchName(country) {
    if (country == "France") return "France";
    if (country == "United Kingdom") return "Royaume-Uni";
    if (country == "United States") return "États-Unis";
    if (country == "Spain") return "Espagne";
    if (country == "Germany") return "Allemagne";
    if (country == "Italy") return "Italie";
    if (country == "Portugal") return "Portugal";
    if (country == "China") return "Chine";
    if (country == "Japan") return "Japon";
    if (country == "Vietnam") return "Vietnam";
    if (country == "Russia") return "Russie";
    if (country == "Brazil") return "Brésil";
    if (country == "Mexico") return "Mexique";
    if (country == "Morocco") return "Maroc";
    return "unknown";
}

function collapseFormContent(element) {
    var coll = document.getElementsByClassName("collapsibleContent");
    var collapsibleSibling = element.nextElementSibling;
    element.classList.toggle("openedCollapsible");

    if(collapsibleSibling) {
        if (collapsibleSibling.style.maxHeight){
            collapsibleSibling.style.maxHeight = null;
        } else {
            collapsibleSibling.style.maxHeight = collapsibleSibling.scrollHeight + "px";
        }
    } else {
        for (collapsibleContent of coll) {
            if (collapsibleContent.style.maxHeight){
                collapsibleContent.style.maxHeight = null;
            } else {
                collapsibleContent.style.maxHeight = collapsibleContent.scrollHeight + "px";
            }
        }
    }

    // if we open the stylesheet the max height of the form must be updated
    if (element.id == 'stylesheet-content'){
        const queryForm = document.getElementById('tab');
        queryForm.style.maxHeight = (queryForm.scrollHeight + collapsibleSibling.scrollHeight) + 'px';
    }
}

function isURI(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function setIconsTooltip(id){
    d3.selectAll(id).each(function(){
        if (this._tippy) {
            this._tippy.destroy();
        }
    })

    tippy(id, {
        theme: 'light',
        placement: 'right-start',
        allowHTML: true,
        appendTo: document.body,
        followCursor: false,
        animation: 'scale'
    })
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToCSV(filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j].innerText);
        
        csv.push(row.join(","));        
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}


function download(content, fileName) {
    const a = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

// allow "tab" in the textarea
function setTabAction(element) {
    element.addEventListener('keydown', function(e) {
        if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
    
        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) +
            "\t" + this.value.substring(end);
    
        // put caret at right position again
        this.selectionStart =
            this.selectionEnd = start + 1;
        }
    });
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function showCheckboxes(elem) {
    let sibling = elem.nextElementSibling;
    if (!sibling) return    
    
    if (sibling.style.display === 'none') {
      sibling.style.display = "block";
    } else {
      sibling.style.display = "none";
    }
}