const fetch = require('node-fetch')
const { promisify } = require('util')
const { parseString } = require('xml2js')
const parseXML = promisify(parseString)
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} = require('graphql')

const TradeMarkType = new GraphQLObjectType({
  name: 'TradeMark',
  description: 'This is a Trade Mark registered on TMview',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: 'Trade Mark name',
      resolve: xml =>
        xml.ApplicantDetails[0].Applicant[0].ApplicantAddressBook[0]
          .FormattedNameAddress[0].Name[0].FreeFormatName[0]
          .FreeFormatNameDetails[0].FreeFormatNameLine[0]
    },
    image: {
      type: GraphQLString,
      description: 'Trade Mark image (in case of having one)',
      resolve: xml =>
        xml.MarkImageDetails
          ? xml.MarkImageDetails[0].MarkImage[0].MarkImageURI[0]
          : 'NO IMAGE'
    }
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'GraphQL query for TMview',
    fields: () => ({
      trademarks: {
        type: new GraphQLList(TradeMarkType),
        args: {
          name: {
            type: GraphQLString
          }
        },
        resolve: (root, { name }) =>
          fetch(`https://www.tmdn.org/tmview/trademark/search?tm=${name}`)
            .then(res => res.text())
            .then(parseXML)
            .then(
              xml =>
                xml.Transaction.TradeMarkTransactionBody[0]
                  .TransactionContentDetails[0].TransactionData[0]
                  .TradeMarkDetails[0].TradeMark
            )
      }
    })
  })
})
