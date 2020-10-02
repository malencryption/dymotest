import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLabelXml } from "./utils";

function PrintLabel() {
  // stores loaded label info
  let labelRef = useRef("");
  const dymo = window.dymo;

  const [name, setName] = useState("Enter Your Name");
  
  // loads label XML then user selects it in file open dialog
  const loadLabelXml = useCallback(() => {
    let printButton = document.getElementById('printButton');
    labelRef.current = dymo.label.framework.openLabelXml("");

    let labelXml = generateLabelXml(name);
    labelRef.current = dymo.label.framework.openLabelXml(labelXml);
    // let res=labelRef.current.isValidLabel();
    // console.log(res);

    updatePreview();
    printButton.disabled = false;
  }, [name, dymo.label.framework]);

  useEffect(() => {
    loadLabelXml();
  }, [name, loadLabelXml]);

  function initTests()
	{
		if(dymo.label.framework.init)
		{
			//dymo.label.framework.trace = true;
			dymo.label.framework.init(onload);
		} else {
			onload();
		}
  }

  // Generates label preview and updates corresponding <img> element
  // Note: this does not work in IE 6 & 7 because they don't support data urls
  // if you want previews in IE 6 & 7 you have to do it on the server side
  function updatePreview() {
    if (!labelRef.current) {
      return;
    }

    let pngData = labelRef.current.render();
    let labelImage = document.getElementById('labelImage');
    labelImage.src = "data:image/png;base64," + pngData;
  }
  
  function onload() {

    let printersSelect = document.getElementById('printersSelect');
    let printButton = document.getElementById('printButton')

    // initialize controls
    printButton.disabled = true;

    // loads all supported printers into a combo box 
    function loadPrinters() {
      let printers = dymo.label.framework.getPrinters();
      if (!printers.length) {
          alert("No DYMO printers are installed. Install DYMO printers.");
          return;
      }

      for (let i = 0; i < printers.length; i++) {
          let printerName = printers[i].name;

          let option = document.createElement('option');
          option.value = printerName;
          option.appendChild(document.createTextNode(printerName));
          printersSelect.appendChild(option);
      }
    }

    loadLabelXml();

    // prints the label
    printButton.onclick = function() {
        try {               
            if (!labelRef.current) {
                alert("Load label before printing");
                return;
            }

            //alert(printersSelect.value);
            labelRef.current.print(printersSelect.value);
            //label.print("unknown printer");
        }
        catch(e) {
            alert(e.message || e);
        }
    }

    // load printers list on startup
    loadPrinters();
  }

  // load when this component is rendered, only once, unless [TBA] changes
  useEffect(() => {  
   
    // register onload event
    if (window.addEventListener) {
        window.addEventListener("load", initTests, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", initTests);
    } else {
        window.onload = initTests; 
    }
  });
    
    return (
        <div id="wrapper">
            <div className="labelDesignArea"> 

                <label htmlFor="labelTextArea">Enter Your Name:</label>
                <input value={name} title="Name" onChange={(e) => setName(e.target.value)} />

            </div>

            <div id="labelImageDiv">
                <img id="labelImage" src="" alt="label preview"/>
            </div>

            <div id="printersDiv">
                <label htmlFor="printersSelect">Printer:</label>
                <select id="printersSelect"></select>
            </div>

            <div id="printDiv">
              <button id="printButton">Print</button>
            </div>
        </div>
    )
}

export default PrintLabel;