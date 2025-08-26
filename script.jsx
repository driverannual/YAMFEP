#target photoshop

if (typeof JSON === 'undefined') {
    JSON = {};
}

if (typeof JSON.parse !== 'function') {
    JSON.parse = function (s) {
        return eval('(' + s + ')');
    };
}

function readJSON(filePath) {
    var file = new File(filePath);
    if (!file.exists) {
        alert("Arquivo JSON não encontrado: " + filePath);
        return null;
    }
    file.open('r');
    var str = file.read();
    file.close();
    return JSON.parse(str);
}

function exportLayerAsJPG(doc, outputFolder, fileName) {
    var opts = new JPEGSaveOptions();
    opts.quality = 8; // qualidade máxima
    opts.embedColorProfile = true;
    opts.formatOptions = FormatOptions.STANDARDBASELINE;

    var saveFile = new File(outputFolder + "/" + fileName + ".jpg");
    doc.saveAs(saveFile, opts, true, Extension.LOWERCASE);
}

function findLayerByName(container, name) {
    for (var i = 0; i < container.artLayers.length; i++) {
        if (container.artLayers[i].name === name) {
            return container.artLayers[i];
        }
    }

    for (var j = 0; j < container.layerSets.length; j++) {
        var found = findLayerByName(container.layerSets[j], name);
        if (found) return found;
    }
    return null;
}

(function main() {
    if (!app.documents.length) {
        alert("Nenhum documento aberto.");
        return;
    }

    var doc = app.activeDocument;

    var psdFile = new File(doc.fullName);
    var baseFolder = psdFile.path;
    var outputFolder = new Folder(baseFolder + "/output");
    if (!outputFolder.exists) outputFolder.create();

    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.path;
    var jsonFile = new File(scriptFolder + "/config.json");

    var data = readJSON(jsonFile);
    if (!data || !data.names) {
        alert("JSON inválido ou sem lista de nomes.");
        return;
    }

    for (var i = 0; i < data.names.length; i++) {
        var layerName = data.names[i];
        var layer = findLayerByName(doc, layerName);
        if (layer) {
            layer.visible = true;
            exportLayerAsJPG(doc, outputFolder, layerName);
            layer.visible = false;
        } else {
            alert("Camada não encontrada: " + layerName);
        }
    }

    alert("Processo concluído!");
})();
