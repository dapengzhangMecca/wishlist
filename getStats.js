const xml2js = require('xml2js')
const fs = require('fs')
const sourceFilePath = process.argv[2]
const outputFilePath = process.argv[3]

// read XML from a file
const xml = fs.readFileSync(sourceFilePath)

// convert XML to JSON
xml2js.parseString(
  xml,
  {
    mergeAttrs: true,
  },
  (err, result) => {
    if (err) {
      throw err
    }

    const wishlists = result['product-lists']['product-list']
    const statistics = wishlists
      .map(item => ({
        user:
          item.owner &&
          item.owner[0] &&
          item.owner[0].email &&
          item.owner[0].email[0],
        count:
          item.items &&
          item.items[0] &&
          item.items[0]['product-item'] &&
          item.items[0]['product-item'].length,
      }))
      .filter(item => item.count >= 150)
      .sort((a, b) => {
        return b.count - a.count
      })
    console.log(`Total: ${wishlists.length}\n>=150: ${statistics.length}`)

    fs.writeFile(
      outputFilePath,
      JSON.stringify(
        {
          description: 'Wishlists with items more than or equal to 150',
          number: statistics.length,
          details: statistics,
        },
        null,
        4,
      ),
      () => {},
    )
  },
)
