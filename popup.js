'use strict';

async function reloadCurrentTab() {
	try {
		chrome.windows.getCurrent(w => {
			chrome.tabs.query({ active:true, windowId:w.id }, (tabs) => {
				if(tabs.length>0) {
					console.log("Active tabs are available");
					chrome.tabs.reload(tabs[0].id);
				} else {
					console.log("No active tabs are available")
				}
			});
		});
	} catch(error) {
		console.error("Error:",error)
	}
}

async function relayToContent(subCharacters) {
	try {
		//console.log("Inside relayToContent:" + `${subCharacters}`)
		chrome.windows.getCurrent(w => {
			chrome.tabs.query({ active:true, windowId:w.id }, (tabs) => {
				
				if(tabs.length>0) {
					console.log("Active tabs are available");
					chrome.scripting.executeScript({
						target: {tabId: tabs[0].id},
						func: (subCharacters) => {
							function replaceRecursively(element, from, to) {
								var regexFrom = new RegExp(from,'g');
								if (element.childNodes.length) {
									element.childNodes.forEach(child => replaceRecursively(child, regexFrom, to));
								} else {
									const cont = element.textContent;
									if (cont) element.textContent = cont.replace(regexFrom, to);
								}
							}; 
							
							//document.body.style.backgroundColor = 'lightblue';
							
							//The output appears in the developers tool log, not the popup's log
							const ref = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
							//const mirrored = "_ɒdɔbɘʇϱતiᒑʞlmnoqpɿƨɟuvwxγzAᗺƆᗡ∃ꟻ⅁HIᒐꓘ⅃MИOᑫϘЯƧTUVWXYZ1234567890_";
							const mirrored = "_\u0252d\u0254b\u0258\u0287\u03F1\u0AA4i\u1491\u029Elmnoqp\u027F\u01A8\u025FuvwxyzA\u15FA\u0186\u15E1\u2203\uA7FB\u2141HI\u1490\uA4D8\u2143M\u0418O\u146B\u03D8\u042F\u01A7TUVWXYZ1234567890_"
							//console.log("Mirrored: " + mirrored)
							
							//console.log("wholeText length:" + `${wholeText.length}`);
							var wholeText = document.body.innerHTML;
							for(let j=0;j<64;j++) {
								var temp = subCharacters.substring(j,j+1);
								var refChar = ref.substring(j,j+1);
								//var mirroredChar = "\u0252";
								var mirroredChar = mirrored.substring(j,j+1);
								var wholeText = document.body.innerHTML
								if(temp == 1 && refChar!="_") {
									console.log("Replacing for: " + refChar);
									replaceRecursively(document.body,refChar,mirroredChar);
								}
							}
							/*
							document.querySelectorAll('*').forEach(element => {
								if(element) {
									if(element.textContent.includes(refChar)) {
									replaceRecursively(element.textContent,refChar,mirroredChar)
									}
								}
								
								if(element.shadowRoot) {
									replaceRecursively(element.shadowRoot,refChar,mirroredChar)
								}
							}); */
						}, 
						args: [subCharacters]
				});
			} else {
					console.log("No active tabs are available")
			}
		});
		
	});
	return true;
	} catch(error) {
		console.error("Error:",error)
	}
};

const readStorage = async (key) => {
	return new Promise((resolve,reject) => {
		chrome.storage.sync.get([key],function (result) {
			if(result[key] === undefined) {
				reject()
			} else {
				resolve(result[key]);
			}
		});
	});
};

async function getLetters() {
	try {
		let subCharacters = await readStorage("subCharacters");
		return subCharacters;
	} catch(error) {
		console.error("Error reading from storage", error);
	}
}

async function substitute() {
	var subCharacters = await getLetters();
	relayToContent(subCharacters);
}

//Function to modify existing variable
function setLetters(event) {
	const ref = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
	const mirrored = "_\u0252d\u0254b\u0258\u0287\u03F1\u0AA4i\u1491\u029Elmnoqp\u027F\u01A8\u025FuvwxyzA\u15FA\u0186\u15E1\u2203\uA7FB\u2141HI\u1490\uA4D8\u2143M\u0418O\u146B\u03D8\u042F\u01A7TUVWXYZ1234567890_"
	
	const charPos = parseInt(event.target.value);
	console.log("Position " + `${charPos}`);
	const letter = event.target.id;
	console.log("Letter " + letter);
	
	if(this.textContent == letter) {
		this.textContent = mirrored.substring(charPos,charPos+1);
	} else {
		this.textContent = letter;
	}
	
	//Get current variable
	chrome.storage.sync.get("subCharacters", function(obj) {
		var subCharacters = obj.subCharacters;
		if(typeof subCharacters === "undefined") {
			//Not available in storage
			//console.log("Var subCharacters not found");
			
			chrome.storage.sync.set({"subCharacters":"0000000000000000000000000000000000000000000000000000000000000000"}, function() {
				console.log("subCharacters variable has been reset");
				chrome.storage.sync.get("subCharacters", function(obj) {
			var subCharacters = obj.subCharacters;
			console.log(`${subCharacters}`);
		});
	});
		} else {
			//Available in storage
			//console.log("Var subCharacters found");
			//console.log(`${subCharacters}`);
			
			//Change the relevant bit in the variable in storage
			//console.log(`${subCharacters.substring(charPos,charPos+1)}`);
			var subCharacterDigit = subCharacters.substring(charPos,charPos+1)
			if(subCharacterDigit == 1) {
				chrome.storage.sync.set({"subCharacters":subCharacters.substring(0,charPos) + 0 + subCharacters.substring(charPos+1)}, function() {
				});
				chrome.storage.sync.get("subCharacters", function(obj) {
				var subCharacters = obj.subCharacters;
				console.log("Changed: "+`${subCharacters}`);
		});
			} else {
				chrome.storage.sync.set({"subCharacters":subCharacters.substring(0,charPos) + 1 + subCharacters.substring(charPos+1)}, function() {
				});
				chrome.storage.sync.get("subCharacters", function(obj) {
				var subCharacters = obj.subCharacters;
				console.log("Changed: "+`${subCharacters}`);
				
				let element = document.querySelector(".small");
				if(element) {
					console.log("Element found")
					var regexFrom = new RegExp("e",'g');
					var popupText = element.innerHTML;
					element.innerHTML = popupText.replace(/e/g,"xxx");
					//element.innerHTML = element.innerHTML.replace(regexFrom,"xxx");
				}
		});
			}
		}
	});
	
}

async function resetAll() {
	const ref = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
	
	//Set the variable back to the default in storage
	chrome.storage.sync.set({"subCharacters":"0000000000000000000000000000000000000000000000000000000000000000"}, function() {
		console.log("subCharacters variable has been reset");
		chrome.storage.sync.get("subCharacters", function(obj) {
			var subCharacters = obj.subCharacters;
			console.log(`${subCharacters}`);
		});
	});
	reloadCurrentTab();
	
	for(let i=0;i<64;i++) {
		var refChar = ref.substring(i,i+1);
		if(refChar!='_' && refChar!='z' && refChar!='Z') {
			var letter = document.getElementById(refChar);
			if(letter) {
				letter.textContent = refChar;
			}
		}
	}
}

function openLink() {
	chrome.tabs.create({ url: "https://play.google.com/store/apps/details?id=com.eGraphene.Textract"});
}


chrome.storage.sync.set({"subCharacters":"0000000000000000000000000000000000000000000000000000000000000000"}, function() {
	console.log("subCharacters variable is set");
});
document.getElementById('a').addEventListener('click',setLetters);
document.getElementById('b').addEventListener('click',setLetters);
document.getElementById('c').addEventListener('click',setLetters);
document.getElementById('d').addEventListener('click',setLetters);
document.getElementById('e').addEventListener('click',setLetters);
document.getElementById('f').addEventListener('click',setLetters);
document.getElementById('g').addEventListener('click',setLetters);
document.getElementById('h').addEventListener('click',setLetters);
document.getElementById('i').addEventListener('click',setLetters);
document.getElementById('j').addEventListener('click',setLetters);
document.getElementById('k').addEventListener('click',setLetters);
document.getElementById('l').addEventListener('click',setLetters);
document.getElementById('m').addEventListener('click',setLetters);
document.getElementById('n').addEventListener('click',setLetters);
document.getElementById('o').addEventListener('click',setLetters);
document.getElementById('p').addEventListener('click',setLetters);
document.getElementById('q').addEventListener('click',setLetters);
document.getElementById('r').addEventListener('click',setLetters);
document.getElementById('s').addEventListener('click',setLetters);
document.getElementById('t').addEventListener('click',setLetters);
document.getElementById('u').addEventListener('click',setLetters);
document.getElementById('v').addEventListener('click',setLetters);
document.getElementById('w').addEventListener('click',setLetters);
document.getElementById('x').addEventListener('click',setLetters);
document.getElementById('y').addEventListener('click',setLetters);

document.getElementById('A').addEventListener('click',setLetters);
document.getElementById('B').addEventListener('click',setLetters);
document.getElementById('C').addEventListener('click',setLetters);
document.getElementById('D').addEventListener('click',setLetters);
document.getElementById('E').addEventListener('click',setLetters);
document.getElementById('F').addEventListener('click',setLetters);
document.getElementById('G').addEventListener('click',setLetters);
document.getElementById('H').addEventListener('click',setLetters);
document.getElementById('I').addEventListener('click',setLetters);
document.getElementById('J').addEventListener('click',setLetters);
document.getElementById('K').addEventListener('click',setLetters);
document.getElementById('L').addEventListener('click',setLetters);
document.getElementById('M').addEventListener('click',setLetters);
document.getElementById('N').addEventListener('click',setLetters);
document.getElementById('O').addEventListener('click',setLetters);
document.getElementById('P').addEventListener('click',setLetters);
document.getElementById('Q').addEventListener('click',setLetters);
document.getElementById('R').addEventListener('click',setLetters);
document.getElementById('S').addEventListener('click',setLetters);
document.getElementById('T').addEventListener('click',setLetters);
document.getElementById('U').addEventListener('click',setLetters);
document.getElementById('V').addEventListener('click',setLetters);
document.getElementById('W').addEventListener('click',setLetters);
document.getElementById('X').addEventListener('click',setLetters);
document.getElementById('Y').addEventListener('click',setLetters);

document.getElementById('substitute').addEventListener('click',substitute);
document.getElementById('reset').addEventListener('click',resetAll);
document.getElementById('link').addEventListener('click',openLink);