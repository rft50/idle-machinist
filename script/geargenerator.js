const GearGenerator = {};

// takes a gear, removes the hassle of parsing it for details
/**
 * @param {*} gear
 * @param {number|string} id
 * @return {SVGSVGElement}
 */
GearGenerator.render = function(gear, id) {
	return GearGenerator.generate(gear.primary, gear.secondary, id, gear.polish, gear.lifetime === 0);
};

// this function takes the material datas, not the material names
/**
 * @param {material} prim
 * @param {material} sec
 * @param {number|string} id
 * @param {number} [polish=0]
 * @param {boolean} [broken=false]
 * @return {SVGSVGElement}
 */
GearGenerator.generate = function(prim, sec, id, polish = 0, broken = false) {
	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "100");
	svg.setAttribute("height", "100");

	// declare some shared variables
	let p, ps, g1, g2, temp;
	let ap = prim.color.length === 4 ? prim.color[3] : 1;
	let as = sec.color.length === 4 ? sec.color[3] : 1;

	// color definitions
	let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
	svg.appendChild(defs);
	switch (prim.material) {
		case "wood":
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "primary" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${prim.color[0]},${prim.color[1]},${prim.color[2]},${ap})`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "primaryGrain" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${prim.color[0]+25},${prim.color[1]+25},${prim.color[2]+25},${ap})`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
		case "metal":
			p = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
			p.id = "primary" + id;
			p.setAttribute("cx", "60%");
			p.setAttribute("cy", "60%");
			p.setAttribute("fr", "45%");
			p.setAttribute("r", "90%");
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${prim.color[0]},${prim.color[1]},${prim.color[2]},${ap})`);
			p.appendChild(ps);
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "100%");
			ps.setAttribute("style", `stop-color:rgba(255,255,255,${ap})`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
		case "crystal":
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "primary" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${Math.floor(prim.color[0]*0.75)},${Math.floor(prim.color[1]*0.75)},${Math.floor(prim.color[2]*0.75)},${ap})`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "primarySheen" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${prim.color[0]},${prim.color[1]},${prim.color[2]},${ap})`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "primarySheenX" + id;
			p.setAttribute("gradientTransform", "rotate(45)");
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${Math.floor(prim.color[0]*0.75)},${Math.floor(prim.color[1]*0.75)},${Math.floor(prim.color[2]*0.75)},${ap})`);
			p.appendChild(ps);
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "100%");
			ps.setAttribute("style", `stop-color:rgba(${prim.color[0]},${prim.color[1]},${prim.color[2]},${ap})`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
	}
	switch (sec.material) {
		case "wood":
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "secondary" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${sec.color[0]},${sec.color[1]},${sec.color[2]},${as})`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "secondaryGrain" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${sec.color[0]+25},${sec.color[1]+25},${sec.color[2]+25},${as})`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
		case "metal":
			p = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
			p.id = "secondary" + id;
			p.setAttribute("cx", "60%");
			p.setAttribute("cy", "60%");
			p.setAttribute("fr", "45%");
			p.setAttribute("r", "90%");
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${sec.color[0]},${sec.color[1]},${sec.color[2]},${as})`);
			p.appendChild(ps);
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "100%");
			ps.setAttribute("style", `stop-color:rgba(255,255,255,${as})`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
		case "crystal":
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "secondary" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${Math.floor(sec.color[0]*0.75)},${Math.floor(sec.color[1]*0.75)},${Math.floor(sec.color[2]*0.75)},${as})`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "secondarySheen" + id;
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${sec.color[0]},${sec.color[1]},${sec.color[2]},${as})`);
			p.appendChild(ps);
			defs.appendChild(p);
			p = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
			p.id = "secondarySheenX" + id;
			p.setAttribute("gradientTransform", "rotate(45)");
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "0%");
			ps.setAttribute("style", `stop-color:rgba(${Math.floor(sec.color[0]*0.75)},${Math.floor(sec.color[1]*0.75)},${Math.floor(sec.color[2]*0.75)},${as})`);
			p.appendChild(ps);
			ps = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			ps.setAttribute("offset", "100%");
			ps.setAttribute("style", `stop-color:rgba(${sec.color[0]},${sec.color[1]},${sec.color[2]},${as})`);
			p.appendChild(ps);
			defs.appendChild(p);
			break;
	}

	// filters and masks
	if (prim.material === "wood" || sec.material === "wood") {
		g1 = document.createElementNS("http://www.w3.org/2000/svg", "filter");
		g1.id = "grainBlur";
		g2 = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
		g2.setAttribute("in", "SourceGraphic");
		g2.setAttribute("stdDeviation", "0.5");
		g1.appendChild(g2);
		svg.appendChild(g1);
	}
	if (prim.material === "crystal") {
		g1 = document.createElementNS("http://www.w3.org/2000/svg", "mask");
		g1.id = "circleMask";
		g2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		g2.setAttribute("width", "100");
		g2.setAttribute("height", "100");
		g1.appendChild(g2);
		g2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		g2.setAttribute("cx", "50");
		g2.setAttribute("cy", "50");
		g2.setAttribute("r", "30");
		g2.setAttribute("fill", "white");
		g1.appendChild(g2);
		svg.appendChild(g1);
	}
	if (sec.material === "crystal") {
		g1 = document.createElementNS("http://www.w3.org/2000/svg", "mask");
		g1.id = "smallMask";
		g2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		g2.setAttribute("width", "100");
		g2.setAttribute("height", "100");
		g1.appendChild(g2);
		g2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		g2.setAttribute("cx", "50");
		g2.setAttribute("cy", "50");
		g2.setAttribute("r", "10");
		g2.setAttribute("fill", "white");
		g1.appendChild(g2);
		svg.appendChild(g1);
	}
	if (polish !== 0) {
		g1 = document.createElementNS("http://www.w3.org/2000/svg", "filter");
		g1.id = "polish" + id;
		g2 = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
		g2.setAttribute("stdDeviation", "18");
		g1.appendChild(g2);
		svg.appendChild(g1);
	}


	// shape definitions
	switch (prim.material) {
		case "wood":
			g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g1.setAttribute("fill", `url(#primary${id})`);
			g1.setAttribute("stroke", "black");
			g1.setAttribute("stroke-width", "1");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "45,5 55,5 55,45 95,45 95,55 55,55 55,95 45,95 45,55 5,55 5,45 45,45");
			g1.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "43,50 15,78 22,85 50,57 78,85 85,78 57,50 85,22 78,15 50,43 22,15 15,22");
			g1.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "30");
			g1.appendChild(temp);
			svg.appendChild(g1);
			g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g2.setAttribute("fill", `none`);
			g2.setAttribute("stroke", `url(#primaryGrain${id})`);
			g2.setAttribute("stroke-width", "1");
			g2.setAttribute("filter", "url(#grainBlur)");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			temp.setAttribute("d", "M 50 50 m 0 30 a 50 50 0 0 1 0 -60");
			g2.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			temp.setAttribute("d", "M 50 50 m -21 21 a 65 65 0 0 1 0 -42");
			g2.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			temp.setAttribute("d", "M 50 50 m 21 21 a 35 35 0 0 1 0 -42");
			g2.appendChild(temp);
			svg.appendChild(g2);
			break;
		case "metal":
			g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g1.setAttribute("fill", `url(#primary${id})`);
			g1.setAttribute("stroke", "black");
			g1.setAttribute("stroke-width", "1");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "45,5 55,5 55,45 95,45 95,55 55,55 55,95 45,95 45,55 5,55 5,45 45,45");
			g1.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "43,50 15,78 22,85 50,57 78,85 85,78 57,50 85,22 78,15 50,43 22,15 15,22");
			g1.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "30");
			g1.appendChild(temp);
			svg.appendChild(g1);
			break;
		case "crystal":
			g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g1.setAttribute("fill", `url(#primary${id})`);
			g1.setAttribute("stroke", "black");
			g1.setAttribute("stroke-width", "1");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "45,5 55,5 55,45 95,45 95,55 55,55 55,95 45,95 45,55 5,55 5,45 45,45");
			g1.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			temp.setAttribute("points", "43,50 15,78 22,85 50,57 78,85 85,78 57,50 85,22 78,15 50,43 22,15 15,22");
			g1.appendChild(temp);
			g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g2.setAttribute("mask", "url(#circleMask)");
			g2.setAttribute("stroke-width", "0");
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					temp = document.createElementNS("http://www.w3.org/2000/svg", "rect");
					temp.setAttribute("x", 12.5 + 25 * x);
					temp.setAttribute("y", 12.5 + 25 * y);
					temp.setAttribute("width", "25");
					temp.setAttribute("height", "25");
					temp.setAttribute("fill", `url(#primarySheenX${id})`);
					g2.appendChild(temp);
				}
			}
			g1.appendChild(g2);
			svg.appendChild(g1);
			g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g2.setAttribute("fill", "none");
			g2.setAttribute("stroke", `url(#primarySheen${id})`);
			g2.setAttribute("stroke-width", "0.5");
			g2.setAttribute("mask", "url(#circleMask)");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			temp.setAttribute("d", "M 0 37.5 H 100 M 0 62.5 H 100 M 37.5 0 V 100 M 62.5 0 V 100");
			g2.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "29.5");
			g2.appendChild(temp);
			svg.appendChild(g2);
			break;
	}
	switch (sec.material) {
		case "wood":
			g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g1.setAttribute("fill", `url(#secondary${id})`);
			g1.setAttribute("stroke", "black");
			g1.setAttribute("stroke-width", "1");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "10");
			g1.appendChild(temp);
			svg.appendChild(g1);
			g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g2.setAttribute("fill", `none`);
			g2.setAttribute("stroke", `url(#secondaryGrain${id})`);
			g2.setAttribute("stroke-width", "1");
			g2.setAttribute("filter", "url(#grainBlur)");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			temp.setAttribute("d", "M 50 50 m -7 7 a 20 20 0 0 1 14 -14");
			g2.appendChild(temp);
			svg.appendChild(g2);
			break;
		case "metal":
			g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g1.setAttribute("fill", `url(#secondary${id})`);
			g1.setAttribute("stroke", "black");
			g1.setAttribute("stroke-width", "1");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "10");
			g1.appendChild(temp);
			svg.appendChild(g1);
			break;
		case "crystal":
			g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g1.setAttribute("mask", "url(#smallMask)");
			g1.setAttribute("stroke-width", "0");
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					temp = document.createElementNS("http://www.w3.org/2000/svg", "rect");
					temp.setAttribute("x", 35 + 10 * x);
					temp.setAttribute("y", 35 + 10 * y);
					temp.setAttribute("width", "10");
					temp.setAttribute("height", "10");
					temp.setAttribute("fill", `url(#secondarySheenX${id})`);
					g1.appendChild(temp);
				}
			}
			svg.appendChild(g1);
			g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g2.setAttribute("fill", "none");
			g2.setAttribute("stroke", `url(#secondarySheen${id})`);
			g2.setAttribute("stroke-width", "0.5");
			g2.setAttribute("mask", "url(#smallMask)");
			temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			temp.setAttribute("d", "M 0 45 H 100 M 0 55 H 100 M 45 0 V 100 M 55 0 V 100");
			g2.appendChild(temp);
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "9.5");
			g2.appendChild(temp);
			svg.appendChild(g2);
			break;
	}

	// finalization
	if (polish !== 0) {
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.setAttribute("filter", `url(#polish${id})`);
		temp = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		temp.setAttribute("x", "0");
		temp.setAttribute("y", "0");
		temp.setAttribute("width", "100");
		temp.setAttribute("height", "100");
		temp.setAttribute("fill", "rgba(0,0,0,0)");
		g.appendChild(temp);
		temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		temp.setAttribute("cx", "45");
		temp.setAttribute("cy", "45");
		temp.setAttribute("r", "30");
		temp.setAttribute("fill", `rgba(255,255,255,${0.2 + polish * 0.05})`);
		g.appendChild(temp);
		svg.append(g);
	}

	if (ap !== 0 || as !== 0) {
		let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.setAttribute("fill", "none");
		g.setAttribute("stroke", "black");
		g.setAttribute("stroke-width", "1");
		if (ap !== 0) {
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "30");
			g.appendChild(temp);
		}
		if (as !== 0) {
			temp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			temp.setAttribute("cx", "50");
			temp.setAttribute("cy", "50");
			temp.setAttribute("r", "10");
			g.appendChild(temp);
		}
		svg.appendChild(g);
	}

	if (broken) {
		temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		temp.setAttribute("points", "58,21 52,35 61,38 64,48 67,36 59,32 62,22");
		svg.appendChild(temp);
		temp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		temp.setAttribute("points", "21,58 27,53 33,54 38,57 29,57 23,63");
		svg.appendChild(temp);
	}

	return svg;
};