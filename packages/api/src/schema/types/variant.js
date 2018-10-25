import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

export const VariantInterface = new GraphQLInterfaceType({
  name: 'Variant',
  fields: {
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const VariantSummaryType = new GraphQLObjectType({
  name: 'VariantSummary',
  interfaces: [VariantInterface],
  fields: {
    // variant interface fields
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },
    // other fields
    ac: { type: GraphQLInt },
    ac_hemi: { type: GraphQLInt },
    ac_hom: { type: GraphQLInt },
    an: { type: GraphQLInt },
    af: { type: GraphQLFloat },
    consequence: { type: GraphQLString },
    consequence_in_canonical_transcript: { type: GraphQLBoolean },
    datasets: { type: new GraphQLList(GraphQLString) },
    filters: { type: new GraphQLList(GraphQLString) },
    flags: { type: new GraphQLList(GraphQLString) },
    hgvs: { type: GraphQLString },
    hgvsc: { type: GraphQLString },
    hgvsp: { type: GraphQLString },
    populations: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: 'VariantPopulations',
          fields: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            ac: { type: new GraphQLNonNull(GraphQLInt) },
            an: { type: new GraphQLNonNull(GraphQLInt) },
            ac_hemi: { type: new GraphQLNonNull(GraphQLInt) },
            ac_hom: { type: new GraphQLNonNull(GraphQLInt) },
          },
        })
      ),
    },
    rsid: { type: GraphQLString },
  },
  isTypeOf: variantData => variantData.gqlType === 'VariantSummary',
})
