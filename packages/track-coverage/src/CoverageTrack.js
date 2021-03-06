import { scaleLinear } from 'd3-scale'
import { area } from 'd3-shape'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import { AxisLeft } from '@vx/axis'

import { Button } from '@broad/ui'

import { Legend } from './Legend'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TopPanel = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: ${props => props.width}px;
  margin-left: ${props => props.marginLeft}px;
`

export class CoverageTrack extends Component {
  static propTypes = {
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        buckets: PropTypes.arrayOf(
          PropTypes.shape({
            pos: PropTypes.number.isRequired,
            mean: PropTypes.number,
          })
        ).isRequired,
        color: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        // Opacity must be separate from fill color for SVG epxort because
        // some programs do not recognize RGBA fill colors.
        opacity: PropTypes.number,
      })
    ).isRequired,
    filenameForExport: PropTypes.func,
    height: PropTypes.number,

    // track props
    /* eslint-disable react/require-default-props */
    leftPanelWidth: PropTypes.number,
    offsetRegions: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        stop: PropTypes.number.isRequired,
      })
    ),
    positionOffset: PropTypes.func,
    width: PropTypes.number,
    xScale: PropTypes.func,
    /* eslint-enable react/require-default-props */
  }

  static defaultProps = {
    filenameForExport: () => 'coverage',
    height: 190,
  }

  state = {
    selectedMetric: 'mean',
  }

  plotRef = el => {
    this.plotElement = el
  }

  exportPlot() {
    const { filenameForExport } = this.props
    const { selectedMetric } = this.state

    const serializer = new XMLSerializer()
    const data = serializer.serializeToString(this.plotElement)

    const blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n', data], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filenameForExport({ selectedMetric })}.svg`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  renderArea({ scaleCoverageMetric, scalePosition, totalBases }) {
    const { datasets, height, width } = this.props
    const { selectedMetric } = this.state

    if (totalBases < 2000) {
      const pathGenerator = area()
        .x(bucket => scalePosition(bucket.pos))
        .y0(() => height)
        .y1(bucket => scaleCoverageMetric(bucket[selectedMetric]))
      return datasets.map(dataset => (
        <g key={dataset.name}>
          <path
            d={pathGenerator(
              dataset.buckets.filter(
                bucket => bucket[selectedMetric] !== undefined && bucket[selectedMetric] !== null
              )
            )}
            fill={dataset.color}
            fillOpacity={dataset.opacity}
          />
        </g>
      ))
    }

    const pathGenerator = area()
      .defined(bucket => bucket !== undefined)
      .x((bucket, i) => i)
      .y0(height)
      .y1(bucket => scaleCoverageMetric(bucket[selectedMetric]))

    return datasets.map(dataset => {
      const scaledData = dataset.buckets
        .filter(bucket => bucket[selectedMetric] !== undefined && bucket[selectedMetric] !== null)
        .map(bucket => ({
          ...bucket,
          x: Math.floor(scalePosition(bucket.pos)),
        }))

      const xBuckets = scaledData.reduce((acc, bucket) => {
        if (acc[bucket.x] === undefined) {
          return {
            ...acc,
            [bucket.x]: bucket,
          }
        }
        return acc
      }, {})

      const finalData = [...Array(width)].map((_, i) => xBuckets[i])

      return (
        <g key={dataset.name}>
          <path
            d={pathGenerator(finalData)}
            fill={dataset.color}
            fillOpacity={dataset.opacity}
          />
        </g>
      )
    })
  }

  renderBars({ scaleCoverageMetric, scalePosition, totalBases }) {
    const { datasets, height, offsetRegions, width } = this.props
    const { selectedMetric } = this.state

    const barWidth = width / totalBases - 1

    return datasets.map(dataset => (
      <g key={dataset.name}>
        {dataset.buckets
          .filter(
            bucket =>
              bucket[selectedMetric] !== undefined &&
              bucket[selectedMetric] !== null &&
              offsetRegions.some(region => region.start <= bucket.pos && region.stop >= bucket.pos)
          )
          .map(bucket => {
            const barHeight = height - scaleCoverageMetric(bucket[selectedMetric])
            const x = scalePosition(bucket.pos)
            return (
              <rect
                key={bucket.pos}
                x={x}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                fill={dataset.color}
                fillOpacity={dataset.opacity}
                stroke="none"
              />
            )
          })}
      </g>
    ))
  }

  renderPlot({ scaleCoverageMetric, scalePosition }) {
    const { offsetRegions } = this.props
    const totalBases = offsetRegions.reduce((acc, region) => acc + region.stop - region.start, 0)
    return totalBases < 100
      ? this.renderBars({ scaleCoverageMetric, scalePosition, totalBases })
      : this.renderArea({ scaleCoverageMetric, scalePosition, totalBases })
  }

  render() {
    const { datasets, height, leftPanelWidth, positionOffset, width, xScale } = this.props

    const scalePosition = pos => xScale(positionOffset(pos).offsetPosition)
    const scaleCoverageMetric = scaleLinear()
      .domain([0, 100])
      .range([height, 7])

    const axisWidth = 60

    return (
      <Wrapper>
        <TopPanel marginLeft={leftPanelWidth} width={width}>
          <Legend datasets={datasets} />
          <Button onClick={() => this.exportPlot()}>Save plot</Button>
        </TopPanel>
        <div style={{ marginLeft: leftPanelWidth - axisWidth }}>
          <svg ref={this.plotRef} height={height} width={axisWidth + width}>
            <AxisLeft
              hideZero
              label="Coverage"
              labelProps={{
                fontSize: 14,
                textAnchor: 'middle',
              }}
              left={axisWidth}
              tickLabelProps={() => ({
                dx: '-0.25em',
                dy: '0.25em',
                fill: '#000',
                fontSize: 10,
                textAnchor: 'end',
              })}
              scale={scaleCoverageMetric}
              stroke="#333"
            />
            <g transform={`translate(${axisWidth},0)`}>
              {this.renderPlot({ scalePosition, scaleCoverageMetric })}
              <line x1={0} y1={height} x2={width} y2={height} stroke="#333" />
            </g>
          </svg>
        </div>
      </Wrapper>
    )
  }
}
