import { encode, type EncodeOptions } from "@toon-format/toon";
import { XMLParser } from "fast-xml-parser";
import { Converter } from "./types";

export type XmlToToonOptions = Required<Pick<EncodeOptions, "indent" | "delimiter" | "keyFolding">>;

export const XmlToToonConverter: Converter<XmlToToonOptions> = {
    id: "xml-to-toon",
    label: "XML → TOON",
    inputMime: "application/xml",
    outputMime: "text/plain",
    defaultInput:
        '<users>\n  <user>\n    <id>1</id>\n    <name>Alice</name>\n    <role>admin</role>\n    <active>true</active>\n  </user>\n  <user>\n    <id>2</id>\n    <name>Bob</name>\n    <role>user</role>\n    <active>true</active>\n  </user>\n</users>',
    defaultOptions: {
        indent: 2,
        delimiter: ",",
        keyFolding: "off",
    },
    settingsSpec: [
        {
            key: "indent",
            label: "Indent",
            type: "number",
            options: [
                { value: 2, label: "2" },
                { value: 3, label: "3" },
                { value: 4, label: "4" },
            ],
        },
        {
            key: "delimiter",
            label: "Delimiter",
            type: "select",
            options: [
                { value: ",", label: "Comma" },
                { value: "\t", label: "Tab" },
                { value: "|", label: "Pipe" },
            ],
        },
    ],
    async convert(input, options) {
        const parser = new XMLParser({
            ignoreAttributes: false,
            parseAttributeValue: true,
            parseTagValue: true,
        });
        let parsed: unknown;
        try {
            parsed = parser.parse(input);
        } catch (error: any) {
            throw new Error(error?.message ?? "Invalid XML input");
        }
        return { output: encode(parsed, options) };
    },
    validateInput(input) {
        // Basic validation could be added here, but XMLParser will throw if invalid
        return { ok: true };
    },
};
