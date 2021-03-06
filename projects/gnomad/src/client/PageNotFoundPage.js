import React from 'react'

import { PageHeading } from '@broad/ui'

import InfoPage from './InfoPage'
import Link from './Link'

const PageNotFoundPage = () => (
  <InfoPage>
    <PageHeading>Page Not Found</PageHeading>
    <p>
      This page does not exist. Try searching for a gene, region, or variant or go to the{' '}
      <Link preserveSelectedDataset={false} to="/">
        home page
      </Link>
      .
    </p>
  </InfoPage>
)

export default PageNotFoundPage
