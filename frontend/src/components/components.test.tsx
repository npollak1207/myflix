import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MediaBadges } from './MediaBadges'
import { PosterCard } from './PosterCard'
import type { BaseItemDto } from '@/api/types'

afterEach(cleanup)

const qc = new QueryClient()
const wrap = (ui: ReactNode) => (
  <QueryClientProvider client={qc}>
    <MemoryRouter>{ui}</MemoryRouter>
  </QueryClientProvider>
)

const movie = (over: Partial<BaseItemDto> = {}): BaseItemDto =>
  ({
    Id: 'm1',
    Name: 'Test Movie',
    Type: 'Movie',
    ProductionYear: 2020,
    MediaStreams: [{ Index: 0, Type: 'Video', Width: 3840, VideoRangeType: 'HDR10', Codec: 'hevc' }],
    ImageTags: { Primary: 'tag1' },
    ...over,
  }) as BaseItemDto

describe('MediaBadges', () => {
  it('renders resolution, HDR and codec', () => {
    render(<MediaBadges item={movie()} />)
    expect(screen.getByText('4K')).toBeTruthy()
    expect(screen.getByText('HDR')).toBeTruthy()
    expect(screen.getByText('HEVC')).toBeTruthy()
  })
})

describe('PosterCard', () => {
  it('shows the title and poster badges', () => {
    render(wrap(<PosterCard item={movie()} />))
    expect(screen.getByText('Test Movie')).toBeTruthy()
    expect(screen.getByText('4K')).toBeTruthy()
  })

  it('links a BoxSet to its collection page', () => {
    render(wrap(<PosterCard item={movie({ Type: 'BoxSet', Name: 'HP Collection' })} />))
    // Multiple links exist (poster + hover actions can render); the first is the card.
    expect(screen.getAllByRole('link')[0].getAttribute('href')).toBe('/collection/m1')
  })
})
