/* global Scaler */
{
	let table = document.getElementById("scalerTable");
	let button = document.getElementById("scalerButton");
	let allValid = true;
	let permutations = [[0, 1, 1], [1, 1, 1], [0, 2, 1], [1, 2, 1], [0, 1, 5], [1, 1, 5], [0, 2, 5], [1, 2, 5]];
	// [[m, b], [011, 111, 021, 121, 015, 115, 025, 125]]
	let dataset = {
	    "1*1<sup>l</sup>": [[1, 1], [1, 2, 2, 4, 1, 32, 2, 64]],
        "2*1<sup>l</sup>": [[1, 2], [2, 4, 4, 8, 2, 64, 4, 128]],
        "1*2<sup>l</sup>": [[2, 1], [2, 3, 4, 6, 32, 243, 64, 486]],
        "1*1.5<sup>l</sup>": [[1.5, 1], [1.5, 2.5, 3, 5, 7.59375, 97.65625, 15.1875, 195.3125]]
    };
    let scaler = new Scaler("", 0, 0);

    for (let idx in dataset) {
        let valid = true;
        let result = [];
        let row = document.createElement("tr");
        row.insertCell().innerHTML = idx;

        scaler.name = idx;
        scaler.multiplier = dataset[idx][0][0];
        scaler.base = dataset[idx][0][1];

        // +m, *b, ^l
        for (let i = 0; i < 8; i++) {
            scaler.setMultiplierModifier("*b", permutations[i][0]);
            scaler.setBaseModifier("+m", permutations[i][1]);
            result[i] = scaler.getAtLevel(permutations[i][2]);

            let element = row.insertCell();
            if (result[i] === dataset[idx][1][i]) {
                element.classList.add("valid");
                element.innerText = result[i];
            }
            else {
                element.classList.add("invalid");
                element.innerHTML = `${result[i]}<sub>${dataset[idx][1][i]}</sub>`;
                valid = false;
                allValid = false;
            }
        }

        row.children[0].classList.add(valid ? "valid" : "invalid");
        table.appendChild(row);
    }

    button.classList.add(allValid ? "valid" : "invalid");
}