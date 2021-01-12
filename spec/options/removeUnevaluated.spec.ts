import _Ajv from "../ajv2019"

import chai from "../chai"
chai.should()

const getAJV = (removeUnevaluated) => {
  console.log(removeUnevaluated)
  return new _Ajv({/*removeUnevaluated, */ unevaluated: true})
}
describe("removeUnevaluated option", () => {
  it("should remove all unevaluated properties", () => {
    const ajv = getAJV("all")

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz-to-be-removed",
    }

    ajv.validate("//test/fooBar", object).should.equal(true)
    object.should.have.property("foo")
    object.should.have.property("bar")
    object.should.not.have.property("baz")
  })

  it("should remove properties that would error when `unevaluatedProperties = false`", () => {
    const ajv = getAJV(true)

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
      unevaluatedProperties: false,
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz-to-be-removed",
    }

    ajv.validate("//test/fooBar", object).should.equal(true)
    object.should.have.property("foo")
    object.should.have.property("bar")
    object.should.not.have.property("baz")
  })

  it("should remove properties that would error when `unevaluatedProperties = false` (many properties, boolean schema)", () => {
    const ajv = getAJV(true)

    const schema = {
      type: "object",
      properties: {
        obj: {
          type: "object",
          unevaluatedProperties: false,
          properties: {
            a: {type: "string"},
            b: false,
            c: {type: "string"},
            d: {type: "string"},
            e: {type: "string"},
            f: {type: "string"},
            g: {type: "string"},
            h: {type: "string"},
            i: {type: "string"},
          },
        },
      },
    }

    const data = {
      obj: {
        a: "valid",
        b: "should not be removed",
        additional: "will be removed",
      },
    }

    ajv.validate(schema, data).should.equal(false)
    data.should.eql({
      obj: {
        a: "valid",
        b: "should not be removed",
      },
    })
  })

  it("should remove properties that would error when `unevaluatedProperties` is a schema", () => {
    const ajv = getAJV(true)

    ajv.addSchema({
      $id: "//test/fooBar",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
      unevaluatedProperties: {type: "string"},
    })

    const object = {
      foo: "foo",
      bar: "bar",
      baz: "baz-to-be-kept",
      fizz: 1000,
    }

    ajv.validate("//test/fooBar", object).should.equal(true)
    object.should.have.property("foo")
    object.should.have.property("bar")
    object.should.have.property("baz")
    object.should.not.have.property("fizz")

    ajv.addSchema({
      $id: "//test/fooBar2",
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "string"}},
      unevaluatedProperties: {type: "string", pattern: "^to-be-", maxLength: 10},
    })

    const object1 = {
      foo: "foo",
      bar: "bar",
      baz: "to-be-kept",
      quux: "to-be-removed",
      fizz: 1000,
    }

    ajv.validate("//test/fooBar2", object1).should.equal(true)
    object1.should.have.property("foo")
    object1.should.have.property("bar")
    object1.should.have.property("baz")
    object1.should.not.have.property("fizz")
  })

  it("should remove properties that are unevaluated after the schema is validated against a specific sub-schema in oneOf", () => {
    const ajv = getAJV(true)

    const schema = {
      type: "object",
      properties: {
        obj: {
          type: "object",
          unevaluatedProperties: false,
          properties: {
            a: {type: "string"},
            b: {type: "number"},
          },
          oneOf: [
            {
              properties: {
                c: {type: "string"},
              },
            },
            {
              properties: {
                d: {type: "string"},
              },
            },
          ],
        },
      },
    }

    const data1 = {
      obj: {
        a: "valid",
        b: 123,
        c: "should be kept",
        e: "should be removed",
      },
    }

    ajv.validate(schema, data1).should.equal(true)
    data1.should.eql({
      obj: {
        a: "valid",
        b: 123,
        c: "should be kept",
      },
    })

    const data2 = {
      obj: {
        a: "valid",
        b: 123,
        d: "should be kept",
        e: "should be removed",
      },
    }

    ajv.validate(schema, data1).should.equal(true)
    data2.should.eql({
      obj: {
        a: "valid",
        b: 123,
        d: "should be kept",
      },
    })
  })
})
