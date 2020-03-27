Variable.init();

window.MathJax = {
	config : {
		options: {
		menuOptions: {
			settings: {
			renderer: 'SVG',     // or 'CHTML'
			inTabOrder: false,      // true if tabbing includes math
			},
		}
		},
		svg : {
			mathmlSpacing : false
		},
		startup:{
			output: 'svg'
		},
		loader: {
			load: ['output/svg','[tex]/unicode']
		},
		tex:{
			packages: {
				'[+]': ['unicode']
			},
			digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/
		}
	}
};

function updateLocale() {
	Parser.init();	
	window.MathJax.config.tex.digits = commaIsDecimalPoint ? 
			/^(?:[0-9]+(?:\{'\}[0-9]{3})*(?:\,[0-9]*)?|\,[0-9]+)/:
			/^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/;
	MathJax.startup.getComponents()
}