const emel = require("../src/emel.js");

describe("emel", () => {
	test("should return a document fagment", () => {
		expect(emel().nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
		expect(emel("span").childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
		expect(emel("div{test}").childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
	});

	test("should return an element with 2 children", () => {
		const el = emel("div*2");
		expect(el.childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
		expect(el.childNodes).toHaveLength(2);
	});

	test("should create a plain text node", () => {
		const el = emel("{test}");
		expect(el.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
		expect(el.childNodes[0].textContent).toBe("test");
	});

	describe("tag", () => {
		test("should set tag name", () => {
			const el = emel("test");
			expect(el.childNodes[0].tagName.toLowerCase()).toBe("test");
		});

		test("should set tag name to div if none given", () => {
			const el = emel("#test");
			expect(el.childNodes[0].tagName.toLowerCase()).toBe("div");
		});
	});

	describe("id", () => {
		test("should set id", () => {
			const el = emel("#test");
			expect(el.childNodes[0].id).toBe("test");
		});
	});

	describe("class", () => {
		test("should set class", () => {
			const el = emel(".test");
			expect(el.childNodes[0].classList.contains("test")).toBe(true);
		});
	});

	describe("attribute", () => {
		test("should set attribute", () => {
			const el = emel("[test='t']");
			expect(el.childNodes[0].getAttribute("test")).toBe("t");
		});

		test("should set attribute with undefined as boolean", () => {
			const el = emel("[test]");
			expect(el.childNodes[0].getAttribute("test")).toBe("");
		});

		test("should set boolean attribute", () => {
			const el = emel("[test.]");
			expect(el.childNodes[0].getAttribute("test")).toBe("");
		});
	});

	describe("text", () => {
		test("should set textContent", () => {
			const el = emel("span{test}");
			expect(el.childNodes[0].textContent).toBe("test");
		});
	});

	describe("children", () => {
		test("should append children", () => {
			const el = emel("div>span*2");
			expect(el.childNodes[0].childNodes).toHaveLength(2);
		});
	});

	describe("placeholders", () => {
		describe("node", () => {
			test("should replace placeholder with HTMLElement", () => {
				const span = document.createElement("span");
				const el = emel("div{?}", { placeholders: span });
				expect(el.childNodes[0].childNodes.length).toBe(1);
				expect(el.childNodes[0].childNodes[0].tagName.toLowerCase()).toBe("span");
			});

			test("should replace placeholder with HTMLElement in array", () => {
				const span = document.createElement("span");
				const el = emel("div{?}", { placeholders: [span] });
				expect(el.childNodes[0].childNodes.length).toBe(1);
				expect(el.childNodes[0].childNodes[0].tagName.toLowerCase()).toBe("span");
			});
		});

		describe("array", () => {
			test("should replace placeholder in textNode", () => {
				const el = emel("{?}", { placeholders: ["test"] });
				expect(el.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
				expect(el.childNodes[0].textContent).toBe("test");
			});

			test("should replace placeholder in element text", () => {
				const el = emel("div{?}", { placeholders: ["test"] });
				expect(el.childNodes[0].textContent).toBe("test");
			});

			test("should set tag name", () => {
				const el = emel("?", { placeholders: ["test"] });
				expect(el.childNodes[0].tagName.toLowerCase()).toBe("test");
			});

			test("should replace placeholder in attribute", () => {
				const el = emel("[test='?']", { placeholders: ["t"] });
				expect(el.childNodes[0].getAttribute("test")).toBe("t");
			});

			test("should replace placeholder in attribute name", () => {
				const el = emel("[?=?]", { placeholders: ["test", "t"] });
				expect(el.childNodes[0].getAttribute("test")).toBe("t");
			});

			test("should not replace after all values used", () => {
				const el = emel("[?=?]", { placeholders: ["test"] });
				expect(el.childNodes[0].getAttribute("test")).toBe("?");
			});

			test("should replace placeholder in id", () => {
				const el = emel("#?", { placeholders: ["test"] });
				expect(el.childNodes[0].id).toBe("test");
			});

			test("should replace placeholder in class", () => {
				const el = emel(".?", { placeholders: ["test"] });
				expect(el.childNodes[0].classList.contains("test")).toBe(true);
			});

			test("should replace placeholder in id", () => {
				const el = emel("#?", { placeholders: ["test"] });
				expect(el.childNodes[0].id).toBe("test");
			});

			test("should replace placeholder in multiplied elements", () => {
				const el = emel("div>span{?}*2", { placeholders: ["test1", "test2"] });
				expect(el.childNodes[0].childNodes).toHaveLength(2);
				expect(el.childNodes[0].childNodes[0].textContent).toBe("test1");
				expect(el.childNodes[0].childNodes[1].textContent).toBe("test2");
			});

			test("should replace placeholder in children first", () => {
				const el = emel("div>span>span{?}*2^span{?}", { placeholders: ["test1", "test2", "test3"] });
				expect(el.childNodes[0].childNodes).toHaveLength(2);
				expect(el.childNodes[0].childNodes[0].childNodes).toHaveLength(2);
				expect(el.childNodes[0].childNodes[0].childNodes[0].textContent).toBe("test1");
				expect(el.childNodes[0].childNodes[0].childNodes[1].textContent).toBe("test2");
				expect(el.childNodes[0].childNodes[1].textContent).toBe("test3");
			});

			test("should replace text placeholder after attributes", () => {
				const el = emel("?{?}#?.?[?='?']", {
					placeholders: ["tag", "id", "class", "attrName", "attr Value", "text"]
				});
				expect(el.childNodes[0].tagName.toLowerCase()).toBe("tag");
				expect(el.childNodes[0].id).toBe("id");
				expect(el.childNodes[0].classList.contains("class")).toBe(true);
				expect(el.childNodes[0].getAttribute("attrName")).toBe("attr Value");
				expect(el.childNodes[0].textContent).toBe("text");
			});
		});

		describe("string", () => {
			test("should replace all placeholders", () => {
				const el = emel("?{?}#?.?[?=?]", {
					placeholders: "test"
				});
				expect(el.childNodes[0].tagName.toLowerCase()).toBe("test");
				expect(el.childNodes[0].id).toBe("test");
				expect(el.childNodes[0].classList.contains("test")).toBe(true);
				expect(el.childNodes[0].getAttribute("test")).toBe("test");
				expect(el.childNodes[0].textContent).toBe("test");
			});

			test("should replace with empty string", () => {
				const el = emel("div{?}", {
					placeholders: ""
				});
				expect(el.childNodes[0].textContent).toBe("");
			});
		});

		describe("number", () => {
			test("should replace with a number", () => {
				const el = emel("div{?}", {
					placeholders: 1
				});
				expect(el.childNodes[0].textContent).toBe("1");
			});

			test("should replace with a zero", () => {
				const el = emel("div{?}", {
					placeholders: 0
				});
				expect(el.childNodes[0].textContent).toBe("0");
			});
		});

		describe("boolean", () => {
			test("should replace with 'true'", () => {
				const el = emel("div{?}", {
					placeholders: true
				});
				expect(el.childNodes[0].textContent).toBe("true");
			});

			test("should replace with 'false'", () => {
				const el = emel("div{?}", {
					placeholders: false
				});
				expect(el.childNodes[0].textContent).toBe("false");
			});

			test("should replace attribute with 'false'", () => {
				const el = emel("div[attr=val]", {
					placeholders: {val: false}
				});
				expect(el.childNodes[0].getAttribute("attr")).toBe("false");
			});

			test("should remove attribute on false name", () => {
				const el = emel("div[attr=val]", {
					placeholders: {attr: false}
				});
				expect(el.childNodes[0].getAttribute("false")).toBe(null);
				expect(el.childNodes[0].getAttribute("attr")).toBe(null);
			});

			test("should remove boolean attribute on false", () => {
				const el = emel("div[attr.]", {
					placeholders: {attr: false}
				});
				expect(el.childNodes[0].getAttribute("false")).toBe(null);
				expect(el.childNodes[0].getAttribute("attr")).toBe(null);
			});

			test("should remove attribute on null", () => {
				const el = emel("div[attr.]", {
					placeholders: {attr: null}
				});
				expect(el.childNodes[0].getAttribute("attr")).toBe(null);
			});

			test("should remove attribute on undefined", () => {
				let undef;
				const el = emel("div[attr.]", {
					placeholders: {attr: undef}
				});
				expect(el.childNodes[0].getAttribute("attr")).toBe(null);
			});

			test("should retain boolean attribute on true value", () => {
				const el = emel("div[attr.]", {
					placeholders: {attr: true}
				});
				expect(el.childNodes[0].getAttribute("attr")).toBe("");
			});

			test("should retain attribute on true value", () => {
				const el = emel("div[attr=val]", {
					placeholders: {attr: true}
				});
				expect(el.childNodes[0].getAttribute("attr")).toBe("val");
			});
		});

		describe("object", () => {
			test("should replace labeled placeholders", () => {
				const el = emel("tag{text}#id.class[attr=value]", {
					placeholders: {
						tag: "tag1",
						text: "text1",
						id: "id1",
						class: "class1",
						attr: "attr1",
						value: "value1",
					}
				});
				expect(el.childNodes[0].tagName.toLowerCase()).toBe("tag1");
				expect(el.childNodes[0].id).toBe("id1");
				expect(el.childNodes[0].classList.contains("class1")).toBe(true);
				expect(el.childNodes[0].getAttribute("attr1")).toBe("value1");
				expect(el.childNodes[0].textContent).toBe("text1");
			});

			test("should replace labeled placeholders in array", () => {
				const el = emel("tag{text}#id.class[attr=value]*2", {
					placeholders: {
						tag: ["tag1", "tag2"],
						text: ["text1", "text2"],
						id: ["id1", "id2"],
						class: ["class1", "class2"],
						attr: ["attr1", "attr2"],
						value: ["value1", "value2"],
					}
				});
				expect(el.childNodes[0].tagName.toLowerCase()).toBe("tag1");
				expect(el.childNodes[0].id).toBe("id1");
				expect(el.childNodes[0].classList.contains("class1")).toBe(true);
				expect(el.childNodes[0].getAttribute("attr1")).toBe("value1");
				expect(el.childNodes[0].textContent).toBe("text1");
				expect(el.childNodes[1].tagName.toLowerCase()).toBe("tag2");
				expect(el.childNodes[1].id).toBe("id2");
				expect(el.childNodes[1].classList.contains("class2")).toBe(true);
				expect(el.childNodes[1].getAttribute("attr2")).toBe("value2");
				expect(el.childNodes[1].textContent).toBe("text2");
			});
		});

		describe("options is placeholder", () => {
			describe("node", () => {
				test("should replace placeholder with HTMLElement", () => {
					const span = document.createElement("span");
					const el = emel("div{?}", span);
					expect(el.childNodes[0].childNodes.length).toBe(1);
					expect(el.childNodes[0].childNodes[0].tagName.toLowerCase()).toBe("span");
				});
			});

			describe("array", () => {
				test("should replace placeholder in textNode", () => {
					const el = emel("{?}", ["test"]);
					expect(el.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
					expect(el.childNodes[0].textContent).toBe("test");
				});
			});

			describe("string", () => {
				test("should replace all placeholders", () => {
					const el = emel("?{?}#?.?[?=?]", "test");
					expect(el.childNodes[0].tagName.toLowerCase()).toBe("test");
					expect(el.childNodes[0].id).toBe("test");
					expect(el.childNodes[0].classList.contains("test")).toBe(true);
					expect(el.childNodes[0].getAttribute("test")).toBe("test");
					expect(el.childNodes[0].textContent).toBe("test");
				});
			});

			describe("number", () => {
				test("should replace with a number", () => {
					const el = emel("div{?}", 0);
					expect(el.childNodes[0].textContent).toBe("0");
				});
			});

			describe("boolean", () => {
				test("should replace with 'false'", () => {
					const el = emel("div{?}", false);
					expect(el.childNodes[0].textContent).toBe("false");
				});
			});
		});
	});
});
