const fetch = require('node-fetch')
const { promisify } = require('util')
const { parseString } = require('xml2js')
const { makeExecutableSchema } = require('graphql-tools')

const typeDefs = `
  type Query {
    trademarks(name: String!): [TradeMark]
  }

  type TradeMark {
    name: String!
    image: String!
  }
`

const resolvers = {
  Query: {
    trademarks: (_, { name }) =>
      fetch(`https://www.tmdn.org/tmview/trademark/search?tm=${name}`)
        .then(res => res.text())
        .then(promisify(parseString))
        .then(
          xml =>
            xml.Transaction.TradeMarkTransactionBody[0]
              .TransactionContentDetails[0].TransactionData[0]
              .TradeMarkDetails[0].TradeMark
        )
  },
  TradeMark: {
    name: xml =>
      xml.ApplicantDetails[0].Applicant[0].ApplicantAddressBook[0]
        .FormattedNameAddress[0].Name[0].FreeFormatName[0]
        .FreeFormatNameDetails[0].FreeFormatNameLine[0],
    image: xml =>
      xml.MarkImageDetails
        ? xml.MarkImageDetails[0].MarkImage[0].MarkImageURI[0]
        : 'https://www.tmdn.org/tmview/trademark/image/placeholder.png'
  }
}

module.exports = makeExecutableSchema({ typeDefs, resolvers })
