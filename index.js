const _merge = require('lodash.merge');

class Helpers {

	/**
		Return one or more DOM element(s) with a CSS selector.
		If nothing is found, it returns 'undefined'.

		selector {string}		: The selector to get the element(s).

		return {DOMElement}
	**/
	static get (selector)
	{
		const got = document.querySelectorAll(selector);
		return got.length == 1 ? got[0] : got.length == 0 ? undefined : got;
	}

	/**
		Create a new DOM element.

		tag {string}				: The tag of the element.
		classList ?{array<string>}	: A list of class names.
		id ?{string}				: An ID.

		return {DOMElement}
	**/
	static new (tag, className, id)
	{
		const element = document.createElement(tag);
		element.className = className || '';
		element.id = id || '';
		return element;
	}

	/**
		Return a CSS translate operation string with the given
		value and axis.

		value {string}				: The value of the translation in px.
		axis {string}				: The axis on which to apply the translation.

	**/
	static translateCSS(value, axis)
	{
		if (!axis) {
			throw new Error(`Missing axis in translate function.`);
		}

		return `translate${axis.toUpperCase()}(${value}px)`;
	}

	/**
		Return a CSS rotate operation string with the given
		value and axis.

		value {string}				: The value of the rotation in degrees.
		axis {string}				: The axis on which to apply the rotation.

	**/
	static rotateCSS(value, axis)
	{
		if (!axis) {
			throw new Error(`Missing axis in rotate function.`);
		}

		return `rotate${axis.toUpperCase()}(${value}deg)`;
	}
	
	/**
		Apply a CSS rotation on a given DOM element.
		
		element {DOMElement}		: The element on which we want to apply the transformation.
		value {number}				: The angle of the rotation in degrees.
		axis {string}				: The axis where to apply the transformation.
	**/
	// TODO Improve the code.
	static rotate(element, value, axis)
	{
		if (!element.style) {
			throw new Error(`Can't apply transform on non DOM element '${element}'`);
		}
		
		if (element.style.transform) {
			element.style.transform = Helpers.rotateCSS(value, axis);
		} else {
			element.style.transform = Helpers.rotateCSS(value, axis);			
		}
		
		return element;
	}

	/**
		Apply a CSS translation on a given DOM element.
		
		element {DOMElement}		: The element on which we want to apply the transformation.
		value {number}				: The distance.
		axis {string}				: The axis where to apply the transformation.
	**/
	// TODO Improve the code.
	static translate(element, value, axis)
	{
		if (!element.style) {
			throw new Error(`Can't apply transform on non DOM element`);
		}

		if (element.style.transform) {
			element.style.transform += Helpers.translateCSS(value, axis);
		} else {
			element.style.transform = Helpers.translateCSS(value, axis);
		}
		
		return element;
	}
	
	/**
		Return the center element(s) of an array.
		
		array {array}				: The array where to from the center element(s)
		
		return {array}
	**/
	static center(array)
	{
		let length = array.length,
			middle = length / 2;
		
		if (length % 2 === 0)
		{
			return [array[middle - 1], array[middle]];
		} else {
			return array[Math.floor(middle)];
		}
	}

	/**
		Contains all polyfill functions.
	**/
	static polyfill ()
	{
		if (!('remove' in Element.prototype)) {
			Element.prototype.remove = function() {
				if (this.parentNode) {
					this.parentNode.removeChild(this);
				}
			};
		}
	}

}

class Paper {

	constructor (selector, customSpecs)
	{
		
		Helpers.polyfill();
		
		// Defaults variables.
		/**
			TODO Simplify this to something easier to manipulate.
		**/
		this.defaultsSpecs = {
			map: {
				foldAngle: 40.0,
				rotation: { x: 25.0, y: 0.0, z: 0.0 },
				offset: 0
			},
			pieces: {
				amount: 3,
				width: 	100.0,
				height: 400.0,
				ratio:  4.0,
				aspect: {
					// TODO Add opacity and gradient.
					background: '#FFF',
					seams: 		'#FFFFFA',
					shadow:		'#000000'
				}
				
			},
			
		};

		this.specs = _merge(this.defaultsSpecs, customSpecs || {});

		this.selector = selector;
		
		this.initDOM(selector);
	}

	/**
		Create and insert all the needed DOM elements.
	**/
	initDOM (selector)
	{

		this.container = Helpers.get(selector);
		this.map       = Helpers.new('div', 'map');
		this.groups    = [];

		if (!this.container) {
			console.error(`No element found with the selector '${selector}'.`);
			return false;
		}

		/**
			We create each piece.
			TODO put this in a function so we can add map pieces
			dynamically.
		**/
		for (let i = 0; i < this.specs.pieces.amount; i++) {

			let mapGroup    = Helpers.new('div', 'map-group');
			let pieceLeft   = Helpers.new('div', 'map-piece map-piece-left');
			let pieceRight  = Helpers.new('div', 'map-piece map-piece-right');
			let pieceShadow = Helpers.new('div', 'map-piece-shadow');

			// TODO Make sure the hex value setted here are correct.
			let aspect = this.specs.pieces.aspect;
			
			// Set the customizable styles of the pieces.
						
			// Left piece
			pieceLeft.style.backgroundColor = aspect.background;
			pieceLeft.style.boxShadow       = `inset 0 0 45px ${aspect.seams}`;
			pieceLeft.style.width           = this.specs.pieces.width + 'px';
			pieceLeft.style.height          = this.specs.pieces.height + 'px';
			
			// Right piece
			pieceRight.style.backgroundColor = aspect.background;
			pieceRight.style.boxShadow       = `inset 0 0 45px ${aspect.seams}`;
			pieceRight.style.width           = this.specs.pieces.width + 'px';
			pieceRight.style.height          = this.specs.pieces.height + 'px';
			
			// Shadow
			pieceShadow.style.backgroundColor = aspect.shadow;
			
			
			// TODO may be useful in the future
			this.groups.push({
				group: 	mapGroup,
				left: 	pieceLeft,
				right: 	pieceRight,
				shadow: pieceShadow
			});

			mapGroup.append(pieceLeft);
			mapGroup.append(pieceRight);
			this.map.append(mapGroup);
		}

		this.container.append(this.map);

		return true;

	}

	calculate ()
	{
		let pieces = this.specs.pieces;
		let map    = this.specs.map;

		let rotatedPiecesWidth = pieces.width * Math.cos( map.foldAngle * (Math.PI / 180.0) );
		pieces.height = (pieces.ratio * pieces.width);
		map.offset = 2 * (pieces.width - rotatedPiecesWidth) /** + .45 **/;
	}

	update (newSpecs)
	{
		if (!newSpecs)
		{
			console.error('No new specs has been specified in the parameters.');
			return false;
		}
		
		this.specs = _merge(this.specs, newSpecs);

		this.map.remove();
				
		this.initDOM(this.selector);
		this.render();
	}
	
	/**
		Reset all the transform properties of the map.
	**/
	reset ()
	{
		let cursor = null;
		this.map.style.transform = '';
		
		for (var i = 0; i < this.groups.length; i++)
		{
			cursor = this.groups[i];
			
			cursor.group.style.transform = null;
			cursor.right.style.transform = null;
			cursor.left.style.transform  = null;
		}
	}
	
	render ()
	{
		this.calculate();

		let map = this.specs.map;
		let cursor = null, center;

		// We rotate the whole map on the x, y and z axis.
		Helpers.rotate(this.map, map.rotation.y, 'y');
		Helpers.rotate(this.map, map.rotation.z, 'z');
		Helpers.rotate(this.map, map.rotation.x, 'x');
		
		let compensate = 0;
		
		for (var i = 0; i < this.groups.length; i++)
		{
			cursor = this.groups[i];
			
			// TODO Set the size for each pieces.			
			// TODO Rewrite the titles.
			
			/**
				We rotate on the y axis both pieces of each group
				to give an aspect of folded paper.
			**/
			Helpers.rotate(cursor.left, -map.foldAngle, 'y');
			Helpers.rotate(cursor.right, map.foldAngle, 'y');
			
												
			// NOTE WORK IN PROGRESS

			center = Helpers.center(this.groups);
			
			// Compensate the gap created by the rotation of the pieces.
			Helpers.translate(cursor.group, i * -map.offset, 'x');
			
			compensate += i * map.offset;
			
		}
		
		Helpers.translate(this.map, compensate / 2, 'x');
	}
}


window.Paper = Paper;

// DEBUG
window.Helpers = Helpers;