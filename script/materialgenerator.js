/** @namespace MaterialGenerator */
const MaterialGenerator = {};

/**
 * @memberOf MaterialGenerator
 * @param {material} mat - to parse data from
 * @param {number} id - should be used
 */
MaterialGenerator.generate = function(mat, id) {
	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "100");
	svg.setAttribute("height", "100");

	let p, ps, g, temp;
	
	let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
	svg.appendChild(defs);
	switch (mat.material) {
		case "wood":
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "material" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${mat.color[0]},${mat.color[1]},${mat.color[2]},1)`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "materialGrain" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${mat.color[0]+25},${mat.color[1]+25},${mat.color[2]+25},1)`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
	}

	switch(mat.material) {
		case "wood":
			g = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g.setAttribute("fill", `url(#material${id})`);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "10,65 35,75 35,65 10,55");
			g.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "35,75 85,55 85,45 35,65");
			g.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "10,55 35,65 85,45 60,35");
			g.appendChild(temp);
			svg.appendChild(g);
			g = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g.setAttribute("fill", "none");
			g.setAttribute("stroke", `url(#materialGrain${id})`);
			g.setAttribute("stroke-width", "1");
			g.setAttribute("filter", "url(#grainBlur)");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "10,65 35,75 35,65 10,55");
			g.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "35,75 85,55 85,45 35,65");
			g.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "10,55 35,65 85,45 60,35");
			g.appendChild(temp);
			svg.appendChild(g);
	}

	// finalization
	temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
	temp.setAttribute("fill", "none");
	temp.setAttribute("stroke", "black");
	temp.setAttribute("stroke-width", "1");
	temp.setAttribute("stroke-linecap", "round");
	temp.setAttribute("stroke-linejoin", "round");
	temp.setAttribute("d", "M 10 65 L 35 75 L 85 55 M 10 55 L 35 65 L 85 45 L 60 35 Z v 10 M 35 65 v 10 M 85 45 v 10");
	svg.appendChild(temp);
	return svg;
};
