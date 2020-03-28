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
			mathmlSpacing : false,
			linebreaks: true
		},
		startup:{
			output: 'svg'
		},
		loader: {
			load: ['output/svg','[tex]/unicode']
		},
		tex: {
			maxBuffer: 10240, //doppelt so viel wie normal (in byte)
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