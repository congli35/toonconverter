# TOON (Token-Oriented Object Notation)

TOON is a compact, human-readable serialization format designed for passing structured data to Large Language Models with significantly reduced token usage compared to JSON. It's intended as a lossless, drop-in representation of JSON data specifically optimized for LLM input contexts. The format achieves 30-60% token savings over formatted JSON while maintaining explicit structure through length markers and field declarations that help LLMs parse and validate data reliably.

TOON's strength lies in uniform arrays of objects where it uses a tabular format similar to CSV but with explicit structure. The format borrows YAML's indentation-based structure for nested objects and CSV's tabular format for uniform data rows, then optimizes both for token efficiency. It includes validation guardrails through explicit array lengths and field headers, making it more reliable for LLM comprehension than CSV while being more compact than JSON. The library provides both JavaScript/TypeScript encoding/decoding functions and a CLI tool for converting between JSON and TOON formats.

## Encoding JSON to TOON

Convert JavaScript objects to TOON format for efficient LLM input.

```typescript
import { encode } from '@toon-format/toon'

// Simple tabular data - TOON's optimal use case
const users = {
  users: [
    { id: 1, name: 'Alice', role: 'admin', active: true },
    { id: 2, name: 'Bob', role: 'user', active: true },
    { id: 3, name: 'Charlie', role: 'user', active: false }
  ]
}

const toon = encode(users)
console.log(toon)
// Output:
// users[3]{id,name,role,active}:
//   1,Alice,admin,true
//   2,Bob,user,true
//   3,Charlie,user,false

// Nested objects with indentation
const order = {
  orderId: 'ORD-123',
  customer: {
    name: 'Alice',
    email: 'alice@example.com'
  },
  total: 99.99
}

console.log(encode(order))
// Output:
// orderId: ORD-123
// customer:
//   name: Alice
//   email: alice@example.com
// total: 99.99

// Complex nested arrays with objects
const inventory = {
  items: [
    {
      sku: 'A1',
      tags: ['electronics', 'premium'],
      price: 299.99
    },
    {
      sku: 'B2',
      tags: ['books', 'fiction'],
      price: 14.99
    }
  ]
}

console.log(encode(inventory))
// Output:
// items[2]:
//   - sku: A1
//     tags[2]: electronics,premium
//     price: 299.99
//   - sku: B2
//     tags[2]: books,fiction
//     price: 14.99
```

## Encoding with Alternative Delimiters

Use tab or pipe delimiters for additional token savings and delimiter clarity.

```typescript
import { encode } from '@toon-format/toon'

const data = {
  products: [
    { id: 'P001', name: 'Laptop', category: 'Electronics', price: 999.99 },
    { id: 'P002', name: 'Mouse, Wireless', category: 'Accessories', price: 29.99 },
    { id: 'P003', name: 'Keyboard', category: 'Accessories', price: 79.99 }
  ]
}

// Tab delimiter - often more token-efficient
const toonTab = encode(data, { delimiter: '\t' })
console.log(toonTab)
// Output:
// products[3	]{id	name	category	price}:
//   P001	Laptop	Electronics	999.99
//   P002	Mouse, Wireless	Accessories	29.99
//   P003	Keyboard	Accessories	79.99

// Pipe delimiter - visual clarity
const toonPipe = encode(data, { delimiter: '|' })
console.log(toonPipe)
// Output:
// products[3|]{id|name|category|price}:
//   P001|Laptop|Electronics|999.99
//   P002|"Mouse, Wireless"|Accessories|29.99
//   P003|Keyboard|Accessories|79.99
```

## Key Folding for Nested Data

Collapse single-key wrapper chains into dotted paths to reduce tokens.

```typescript
import { encode } from '@toon-format/toon'

const nested = {
  data: {
    metadata: {
      items: ['a', 'b', 'c']
    }
  }
}

// Standard encoding with nested indentation
console.log(encode(nested))
// Output:
// data:
//   metadata:
//     items[3]: a,b,c

// With key folding - collapses single-key chains
console.log(encode(nested, { keyFolding: 'safe' }))
// Output:
// data.metadata.items[3]: a,b,c

// Control folding depth
const deepNested = {
  level1: {
    level2: {
      level3: {
        level4: {
          value: 42
        }
      }
    }
  }
}

// Limit folding to 2 segments
console.log(encode(deepNested, { keyFolding: 'safe', flattenDepth: 2 }))
// Output:
// level1.level2:
//   level3:
//     level4:
//       value: 42
```

## Decoding TOON to JSON

Parse TOON-formatted strings back to JavaScript objects.

```typescript
import { decode } from '@toon-format/toon'

// Decode tabular TOON data
const toonInput = `users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user`

const data = decode(toonInput)
console.log(JSON.stringify(data, null, 2))
// Output:
// {
//   "users": [
//     { "id": 1, "name": "Alice", "role": "admin" },
//     { "id": 2, "name": "Bob", "role": "user" },
//     { "id": 3, "name": "Charlie", "role": "user" }
//   ]
// }

// Decode nested structures
const nestedToon = `order:
  id: ORD-456
  items[2]{sku,qty,price}:
    A1,2,19.99
    B2,1,29.99
  total: 69.97`

const order = decode(nestedToon)
console.log(order)
// Output:
// {
//   order: {
//     id: 'ORD-456',
//     items: [
//       { sku: 'A1', qty: 2, price: 19.99 },
//       { sku: 'B2', qty: 1, price: 29.99 }
//     ],
//     total: 69.97
//   }
// }

// Strict mode validation (default)
try {
  const invalidToon = `users[3]{id,name}:
    1,Alice
    2,Bob`  // Only 2 rows but declared [3]
  decode(invalidToon)
} catch (error) {
  console.error('Validation failed:', error.message)
  // Output: Validation failed: Expected 3 rows but found 2
}

// Lenient mode - skip validation
const lenient = decode(invalidToon, { strict: false })
console.log(lenient)
// Output: { users: [ { id: 1, name: 'Alice' }, { id: 2, name: 'Bob' } ] }
```

## Path Expansion for Round-Trip Encoding

Reconstruct dotted keys into nested objects for lossless round-trips.

```typescript
import { decode, encode } from '@toon-format/toon'

// Encode with key folding
const original = {
  data: {
    metadata: {
      items: ['a', 'b']
    }
  }
}

const toon = encode(original, { keyFolding: 'safe' })
console.log(toon)
// Output: data.metadata.items[2]: a,b

// Decode with path expansion to restore structure
const restored = decode(toon, { expandPaths: 'safe' })
console.log(JSON.stringify(restored, null, 2))
// Output:
// {
//   "data": {
//     "metadata": {
//       "items": ["a", "b"]
//     }
//   }
// }

// Works with multiple dotted keys
const multiKey = `user.profile.name: Alice
user.profile.email: alice@example.com
user.settings.theme: dark`

const expanded = decode(multiKey, { expandPaths: 'safe' })
console.log(JSON.stringify(expanded, null, 2))
// Output:
// {
//   "user": {
//     "profile": {
//       "name": "Alice",
//       "email": "alice@example.com"
//     },
//     "settings": {
//       "theme": "dark"
//     }
//   }
// }
```

## CLI Usage for File Conversion

Command-line tool for converting between JSON and TOON formats with token statistics.

```bash
# Encode JSON to TOON (auto-detected from .json extension)
npx @toon-format/cli input.json -o output.toon

# Decode TOON to JSON (auto-detected from .toon extension)
npx @toon-format/cli data.toon -o output.json

# Pipe from stdin with encoding
echo '{"name": "Ada", "age": 30}' | npx @toon-format/cli

# Show token savings statistics
npx @toon-format/cli data.json --stats
# Output:
# ✔ Encoded `data.json` → `output.toon`
# ℹ Token estimates: ~245 (JSON) → ~156 (TOON)
# ✔ Saved ~89 tokens (-36.3%)

# Use tab delimiter for maximum efficiency
cat large-dataset.json | npx @toon-format/cli --delimiter "\t" --stats > output.toon

# Pipe delimiter with key folding
npx @toon-format/cli data.json --delimiter "|" --key-folding safe -o output.toon

# Lenient decoding without strict validation
npx @toon-format/cli data.toon --no-strict -o output.json

# Force encode mode when reading from stdin
cat data.json | npx @toon-format/cli --encode --delimiter "\t"

# Force decode mode with path expansion
cat data.toon | npx @toon-format/cli --decode --expand-paths safe --indent 4

# Control folding depth for nested data
npx @toon-format/cli data.json --key-folding safe --flatten-depth 3 -o output.toon
```

## Handling Complex Data Structures

Work with mixed arrays, nested structures, and edge cases.

```typescript
import { encode, decode } from '@toon-format/toon'

// Mixed array types (uses list format)
const mixed = {
  items: [
    42,
    'text',
    true,
    { key: 'value' },
    [1, 2, 3]
  ]
}

console.log(encode(mixed))
// Output:
// items[5]:
//   - 42
//   - text
//   - true
//   - key: value
//   - [3]: 1,2,3

// Arrays of arrays
const matrix = {
  data: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}

console.log(encode(matrix))
// Output:
// data[3]:
//   - [3]: 1,2,3
//   - [3]: 4,5,6
//   - [3]: 7,8,9

// Empty containers
const empty = {
  emptyArray: [],
  emptyObject: {},
  items: [
    { id: 1, tags: [] }
  ]
}

console.log(encode(empty))
// Output:
// emptyArray[0]:
// emptyObject:
// items[1]:
//   - id: 1
//     tags[0]:

// Special value handling
const special = {
  nullValue: null,
  booleans: [true, false],
  numbers: [0, -42, 3.14, 1e6],
  date: new Date('2025-01-01T00:00:00Z'),
  bigInt: 9007199254740991n
}

console.log(encode(special))
// Output:
// nullValue: null
// booleans[2]: true,false
// numbers[4]: 0,-42,3.14,1000000
// date: "2025-01-01T00:00:00.000Z"
// bigInt: 9007199254740991

// Quoted strings (when necessary)
const quoted = {
  strings: [
    'normal',           // unquoted
    'hello world',      // unquoted (inner spaces OK)
    ' padded ',         // quoted (leading/trailing spaces)
    'true',             // quoted (looks like boolean)
    '42',               // quoted (looks like number)
    'a,b',              // quoted (contains delimiter)
    'a:b',              // quoted (contains colon)
    '- item'            // quoted (looks like list)
  ]
}

console.log(encode(quoted))
// Output:
// strings[8]: normal,hello world," padded ","true","42","a,b","a:b","- item"
```

## Custom Encoding Options

Configure indentation, delimiters, and key folding for specific use cases.

```typescript
import { encode } from '@toon-format/toon'

const data = {
  metrics: [
    { date: '2025-01-01', views: 1000, clicks: 50 },
    { date: '2025-01-02', views: 1200, clicks: 65 },
    { date: '2025-01-03', views: 980, clicks: 42 }
  ]
}

// Default options (2-space indent, comma delimiter)
console.log(encode(data))
// metrics[3]{date,views,clicks}:
//   2025-01-01,1000,50
//   2025-01-02,1200,65
//   2025-01-03,980,42

// Custom 4-space indentation
console.log(encode(data, { indent: 4 }))
// metrics[3]{date,views,clicks}:
//     2025-01-01,1000,50
//     2025-01-02,1200,65
//     2025-01-03,980,42

// All options combined
console.log(encode(data, {
  indent: 3,
  delimiter: '\t'
}))
// metrics[3	]{date	views	clicks}:
//    2025-01-01	1000	50
//    2025-01-02	1200	65
//    2025-01-03	980	42
```

## Integration with LLM Workflows

Use TOON in prompts for efficient data transmission to language models.

```typescript
import { encode } from '@toon-format/toon'

// Prepare data for LLM input
const employeeData = {
  employees: [
    { id: 101, name: 'Alice', dept: 'Engineering', salary: 95000 },
    { id: 102, name: 'Bob', dept: 'Sales', salary: 75000 },
    { id: 103, name: 'Charlie', dept: 'Engineering', salary: 105000 },
    { id: 104, name: 'Diana', dept: 'Marketing', salary: 80000 }
  ]
}

// Encode with tab delimiter for maximum token efficiency
const toonData = encode(employeeData, { delimiter: '\t' })

// Construct LLM prompt
const prompt = `Data is in TOON format (2-space indent, tab-separated).

\`\`\`toon
${toonData}
\`\`\`

Task: Return only employees in Engineering with salary > 100000 as TOON.
Use the same header format. Set [N] to match the row count.
Output only the code block.`

console.log(prompt)
// The LLM receives structured data in ~60 tokens instead of ~100+ tokens
// and can easily filter/transform while maintaining the same format

// For generating TOON output, provide explicit instructions
const generationPrompt = `Generate a TOON table of 5 products with these fields:
- id (number)
- name (string)
- price (number)
- inStock (boolean)

Format: products[5]{id,name,price,inStock}:
Rules: 2-space indent, comma-separated, no trailing spaces.

Output only the TOON code block.`

// Process LLM response back to JSON
const llmResponse = `products[2	]{id	name	dept	salary}:
  103	Charlie	Engineering	105000`

const filtered = decode(llmResponse)
console.log(JSON.stringify(filtered, null, 2))
// {
//   "products": [
//     { "id": 103, "name": "Charlie", "dept": "Engineering", "salary": 105000 }
//   ]
// }
```

## Summary

TOON excels at encoding uniform arrays of objects for LLM consumption, providing 30-60% token savings over JSON while maintaining explicit structure through length markers and field declarations. The format's sweet spot is tabular data with consistent schemas across rows, where it achieves CSV-like compactness with better LLM comprehension through validation guardrails. The library provides bidirectional conversion between JSON and TOON through both programmatic APIs (encode/decode) and CLI tools, with flexible options for delimiters (comma, tab, pipe), indentation, key folding for nested data, path expansion for round-trip encoding, and validation strictness.

For integration patterns, use TOON as a translation layer: maintain JSON in your application code, convert to TOON when preparing LLM prompts using encode() with appropriate options (delimiter for token efficiency, keyFolding for nested data reduction), and decode TOON responses back to JSON for processing using decode() with optional expandPaths for structure restoration. The format works best with batch data operations, analytics datasets, database query results, and any scenario where you're repeatedly sending structured records to LLMs. For deeply nested or non-uniform data structures, JSON may be more efficient, but for the common case of uniform tabular data, TOON significantly reduces token costs while improving LLM parsing reliability through its explicit structural annotations like array length markers [N], field declarations {field1,field2}, and delimiter-aware encoding.
