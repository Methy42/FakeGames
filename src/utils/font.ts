import { Font, Table } from "opentype.js";
import fontJSON from "./SourceHanSansCN-Normal.json";

export interface IOTFToJSONResult {
    glyphs: { [code: string]: unknown },
    familyName?: string,
    ascender?: number,
    descender?: number,
    underlinePosition?: number,
    underlineThickness?: number,
    boundingBox?: {
        yMin: number,
        xMin: number,
        yMax: number,
        xMax: number
    },
    resolution?: number,
    original_font_information?: Table,
    cssFontWeight?: string,
    cssFontStyle?: string
};

export const OTFToJSON = function(font: Font){
    var scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);
    var result: IOTFToJSONResult = {
        glyphs: {}
    };

	var restriction = {
		range : null,
		set : null
	};
	
    for (let i = 0; i < font.glyphs.length; i++) {
        const glyph = font.glyphs.get(i);

        const unicodes: number[] = [];
        if (glyph.unicode !== undefined) {
            unicodes.push(glyph.unicode);
        }
        if (glyph.unicodes.length) {
            glyph.unicodes.forEach(function(unicode){
                if (unicodes.indexOf (unicode) == -1) {
                    unicodes.push(unicode);
                }
            })
        }
       
        unicodes.forEach(function(unicode){
			var glyphCharacter = String.fromCharCode (unicode);
			var needToExport = true;
			if (restriction.range !== null) {
				needToExport = (unicode >= restriction.range[0] && unicode <= restriction.range[1]);
			} else if (restriction.set !== null) {
				needToExport = ("".indexOf (glyphCharacter) != -1);
			}
            if (needToExport) {
				var token: {
                    ha: number;
                    x_min: number;
                    x_max: number;
                    o: string;
                } = {
                    ha: 0,
                    x_min: 0,
                    x_max: 0,
                    o: ""
                };
				typeof glyph.advanceWidth === "number" && (token.ha = Math.round(glyph.advanceWidth * scale));
				typeof glyph.xMin === "number" && (token.x_min = Math.round(glyph.xMin * scale));
				typeof glyph.xMax === "number" && (token.x_max = Math.round(glyph.xMax * scale));
				token.o = ""
                glyph.path.commands = reverseCommands(glyph.path.commands);
				glyph.path.commands.forEach(function(command: any,i){
					if (command.type.toLowerCase() === "c") {command.type = "b";}
					token.o += command.type.toLowerCase();
					token.o += " "
					if (command.x !== undefined && command.y !== undefined){
						token.o += Math.round(command.x * scale);
						token.o += " "
						token.o += Math.round(command.y * scale);
						token.o += " "
					}
					if (command.x1 !== undefined && command.y1 !== undefined){
						token.o += Math.round(command.x1 * scale);
						token.o += " "
						token.o += Math.round(command.y1 * scale);
						token.o += " "
					}
					if (command.x2 !== undefined && command.y2 !== undefined){
						token.o += Math.round(command.x2 * scale);
						token.o += " "
						token.o += Math.round(command.y2 * scale);
						token.o += " "
					}
				});
				result.glyphs[String.fromCharCode(unicode)] = token;
			}
        });
    }

    result.familyName = font.names.fontFamily["en"] || font.names.fontFamily["en-us"] || font.names.fontFamily["en-ca"];
    result.ascender = Math.round(font.ascender * scale);
    result.descender = Math.round(font.descender * scale);
    result.underlinePosition = Math.round(font.tables.post.underlinePosition * scale);
    result.underlineThickness = Math.round(font.tables.post.underlineThickness * scale);
    result.boundingBox = {
        "yMin": Math.round(font.tables.head.yMin * scale),
        "xMin": Math.round(font.tables.head.xMin * scale),
        "yMax": Math.round(font.tables.head.yMax * scale),
        "xMax": Math.round(font.tables.head.xMax * scale)
    };
    result.resolution = 1000;
    result.original_font_information = font.tables.name;

    result.cssFontWeight = "normal";
    result.cssFontStyle = "normal";

    return JSON.stringify(result);
};

export const reverseCommands = function(commands: any[]) {
    var paths: any = [];
    var path;
    
    commands.forEach(function(c){
        if (c.type.toLowerCase() === "m"){
            path = [c];
            paths.push(path);
        } else if (c.type.toLowerCase() !== "z") {
            path.push(c);
        }
    });
    
    var reversed: any = [];
    paths.forEach(function (p: any) {
        var result: any = { "type":"m" , "x" : p[p.length-1].x, "y": p[p.length-1].y };
        reversed.push(result);
        
        for (var i = p.length - 1;i > 0; i-- ) {
            var command = p[i];
            result = { "type":command.type };

            if (command.x2 !== undefined && command.y2 !== undefined) {
                result.x1 = command.x2;
                result.y1 = command.y2;
                result.x2 = command.x1;
                result.y2 = command.y1;
            } else if (command.x1 !== undefined && command.y1 !== undefined) {
                result.x1 = command.x1;
                result.y1 = command.y1;
            }
            result.x = p[i-1].x;
            result.y = p[i-1].y;
            reversed.push(result);
        }
        
    });
    
    return reversed;
}