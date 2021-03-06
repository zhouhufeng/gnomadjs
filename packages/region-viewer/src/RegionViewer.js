import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import {
  calculateOffsetRegions,
  calculatePositionOffset,
  invertPositionOffset,
  calculateXScale,
} from './coordinates'

const RegionViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.width}px;
  margin: 0 auto 10px;
  font-size: 12px;
`

export class RegionViewer extends Component {
  static propTypes = {
    children: PropTypes.node,
    featuresToDisplay: PropTypes.arrayOf(PropTypes.string),
    leftPanelWidth: PropTypes.number,
    padding: PropTypes.number.isRequired,
    regions: PropTypes.arrayOf(
      PropTypes.shape({
        feature_type: PropTypes.string.isRequired,
        start: PropTypes.number.isRequired,
        stop: PropTypes.number.isRequired,
      })
    ).isRequired,
    rightPanelWidth: PropTypes.number,
    width: PropTypes.number.isRequired,
  }

  static defaultProps = {
    children: undefined,
    featuresToDisplay: ['CDS'],
    leftPanelWidth: 100,
    rightPanelWidth: 160,
  }

  renderChildren(childProps) {
    const { children } = this.props
    return React.Children.map(
      children,
      child => (child ? React.cloneElement(child, childProps) : null)
    )
  }

  render() {
    const {
      featuresToDisplay,
      regions,
      width,
      padding,
      leftPanelWidth,
      rightPanelWidth,
    } = this.props

    const offsetRegions = calculateOffsetRegions(featuresToDisplay, padding, regions)

    const positionOffset = calculatePositionOffset(offsetRegions)
    const xScale = calculateXScale(width, offsetRegions)
    const invertOffset = invertPositionOffset(offsetRegions, xScale)

    const childProps = {
      leftPanelWidth,
      positionOffset,
      invertOffset,
      xScale,
      width,
      offsetRegions,
      rightPanelWidth,
    }

    return (
      <RegionViewerWrapper width={width + leftPanelWidth + rightPanelWidth}>
        {this.renderChildren(childProps)}
      </RegionViewerWrapper>
    )
  }
}
