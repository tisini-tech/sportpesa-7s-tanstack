import { getEvent, getStat, getSubEvent } from '#/lib/utils'
import PosessionRow from './posession-row'
import StatsRow from './stats-row'
import AccuracyRow from './accuracy-row'
import type { EventStat } from '#/lib/types'

type StatsProps = {
  home: EventStat[]
  away: EventStat[]
}

const calcRugbyPosession = (homeArry: EventStat[], awayArry: EventStat[]) => {
  const homePasses =
    getStat(homeArry, 'Pass') +
    getStat(homeArry, 'Incomplete Pass') +
    getStat(homeArry, 'Forward pass') +
    getSubEvent(homeArry, '255', '645') +
    getSubEvent(homeArry, '255', '644')

  const awayPasses =
    getStat(awayArry, 'Pass') +
    getStat(awayArry, 'Incomplete Pass') +
    getStat(awayArry, 'Forward pass') +
    getSubEvent(awayArry, '255', '645') +
    getSubEvent(awayArry, '255', '644')

  const total = homePasses + awayPasses

  const home = Math.round((homePasses / total) * 100)
  const away = Math.round((awayPasses / total) * 100)

  return { home, away }
}

export const TeamStats = ({ home, away }: StatsProps) => {
  const posession = calcRugbyPosession(home, away)

  const homePass = getStat(home, 'Pass')
  const awayPass = getStat(away, 'Pass')

  const homeOnly = awayPass <= 0
  const awayOnly = homePass <= 0
  const bothTeams = awayPass > 0 && homePass > 0

  const homeSuccKicks =
    getSubEvent(home, '33', '52') +
    getSubEvent(home, '49', '60') +
    getSubEvent(home, '79', '92') +
    getSubEvent(home, '79', '311') +
    getSubEvent(home, '49', '44') +
    getSubEvent(home, '79', '94') +
    getSubEvent(home, '33', '53') +
    getSubEvent(home, '253', '635') +
    getSubEvent(home, '253', '634')
  const awaySuccKicks =
    getSubEvent(away, '33', '52') +
    getSubEvent(away, '49', '60') +
    getSubEvent(away, '79', '92') +
    getSubEvent(away, '79', '311') +
    getSubEvent(away, '49', '44') +
    getSubEvent(away, '79', '94') +
    getSubEvent(away, '33', '53') +
    getSubEvent(away, '253', '635') +
    getSubEvent(away, '253', '634')

  const homeTotalKicks =
    homeSuccKicks +
    getSubEvent(home, '33', '69') +
    getSubEvent(home, '49', '42') +
    getSubEvent(home, '79', '93') +
    getSubEvent(home, '33', '70') +
    getSubEvent(home, '49', '61') +
    getSubEvent(home, '79', '95') +
    getSubEvent(home, '253', '632') +
    getSubEvent(home, '253', '636')
  const awayTotalKicks =
    awaySuccKicks +
    getSubEvent(away, '33', '69') +
    getSubEvent(away, '49', '42') +
    getSubEvent(away, '79', '93') +
    getSubEvent(away, '33', '70') +
    getSubEvent(away, '49', '61') +
    getSubEvent(away, '79', '95') +
    getSubEvent(away, '253', '632') +
    getSubEvent(away, '253', '636')

  const hScrum =
    getSubEvent(home, '51', '38') +
    getSubEvent(home, '63', '47') +
    getSubEvent(home, '76', '88') +
    getSubEvent(home, '262', '702')
  const hTotalScrum =
    hScrum +
    getSubEvent(home, '51', '39') +
    getSubEvent(home, '63', '48') +
    getSubEvent(home, '76', '89') +
    getSubEvent(home, '262', '703')

  const aScrum =
    getSubEvent(away, '51', '38') +
    getSubEvent(away, '63', '47') +
    getSubEvent(away, '76', '88') +
    getSubEvent(away, '262', '702')
  const aTotalScrum =
    aScrum +
    getSubEvent(away, '51', '39') +
    getSubEvent(away, '63', '48') +
    getSubEvent(away, '76', '89') +
    getSubEvent(away, '262', '703')

  const hLineWon =
    getSubEvent(home, '151', '377') +
    getSubEvent(home, '151', '378') +
    getSubEvent(home, '151', '379') +
    getSubEvent(home, '151', '391') +
    getSubEvent(home, '150', '371') +
    getSubEvent(home, '150', '372') +
    getSubEvent(home, '150', '373') +
    getSubEvent(home, '150', '389') +
    getSubEvent(home, '152', '383') +
    getSubEvent(home, '152', '384') +
    getSubEvent(home, '152', '385') +
    getSubEvent(home, '152', '393') +
    getSubEvent(home, '263', '705') +
    getSubEvent(home, '263', '706') +
    getSubEvent(home, '263', '707') +
    getSubEvent(home, '263', '711')
  const hLineThrown =
    getEvent(home, '151') +
    getEvent(home, '150') +
    getEvent(home, '152') +
    getEvent(home, '263')

  const aLineWon =
    getSubEvent(away, '151', '377') +
    getSubEvent(away, '151', '378') +
    getSubEvent(away, '151', '379') +
    getSubEvent(away, '151', '391') +
    getSubEvent(away, '150', '371') +
    getSubEvent(away, '150', '372') +
    getSubEvent(away, '150', '373') +
    getSubEvent(away, '150', '389') +
    getSubEvent(away, '152', '383') +
    getSubEvent(away, '152', '384') +
    getSubEvent(away, '152', '385') +
    getSubEvent(away, '152', '393') +
    getSubEvent(away, '263', '705') +
    getSubEvent(away, '263', '706') +
    getSubEvent(away, '263', '707') +
    getSubEvent(away, '263', '711')
  const aLineThrown =
    getEvent(away, '151') +
    getEvent(away, '150') +
    getEvent(away, '152') +
    getEvent(away, '263')

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="divide-y divide-border/70">
        {bothTeams && (
          <PosessionRow
            homeStat={`${posession.home}`}
            stat={'Possession'}
            awayStat={`${posession.away}`}
          />
        )}

        <StatsRow
          homeStat={
            getEvent(home, '122') +
            getEvent(home, '104') +
            getEvent(home, '123') +
            getEvent(home, '245')
          }
          stat={'Visit in Opp 22'}
          awayStat={
            getEvent(away, '122') +
            getEvent(away, '104') +
            getEvent(away, '123') +
            +getEvent(away, '245')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <StatsRow
          homeStat={
            getSubEvent(home, '33', '51') +
            getSubEvent(home, '33', '142') +
            getSubEvent(home, '49', '66') +
            getSubEvent(home, '49', '200') +
            getSubEvent(home, '79', '91') +
            getSubEvent(home, '79', '201') +
            getSubEvent(home, '253', '638') +
            getSubEvent(home, '253', '639')
          }
          stat={'Tries Scored'} // Try + Penalty Try
          awayStat={
            getSubEvent(away, '33', '51') +
            getSubEvent(away, '33', '142') +
            getSubEvent(away, '49', '66') +
            getSubEvent(away, '49', '200') +
            getSubEvent(away, '79', '91') +
            getSubEvent(away, '79', '201') +
            getSubEvent(away, '253', '638') +
            getSubEvent(away, '253', '639')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <AccuracyRow
          hComp={homeSuccKicks}
          aComp={awayTotalKicks}
          hTotal={homeTotalKicks}
          aTotal={awayTotalKicks}
          stat={'Successful Goal Attempts'}
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <StatsRow
          homeStat={
            getEvent(home, '35') +
            getEvent(home, '41') +
            getEvent(home, '112') +
            getEvent(home, '86') +
            getEvent(home, '87') +
            getEvent(home, '119') +
            getEvent(home, '36') +
            getEvent(home, '40') +
            getEvent(home, '80') +
            getEvent(home, '149') +
            getEvent(home, '103') +
            getEvent(home, '145') +
            getEvent(home, '255')
          }
          stat={'Handling Errors'} // Knock on + Incomplete Pass + Forward pass + lost ball in carry + handling errors
          awayStat={
            getEvent(away, '35') +
            getEvent(away, '41') +
            getEvent(away, '112') +
            getEvent(away, '86') +
            getEvent(away, '87') +
            getEvent(away, '119') +
            getEvent(away, '36') +
            getEvent(away, '40') +
            getEvent(away, '80') +
            getEvent(away, '149') +
            getEvent(away, '103') +
            getEvent(away, '145') +
            getEvent(away, '255')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <AccuracyRow
          hComp={hLineWon}
          aComp={aLineWon}
          hTotal={hLineThrown}
          aTotal={aLineThrown}
          stat={'Lineouts Won / Thrown'}
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <AccuracyRow
          hComp={hScrum}
          aComp={aScrum}
          hTotal={hTotalScrum}
          aTotal={aTotalScrum}
          stat={'Scrums Won / Fed'}
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <StatsRow
          homeStat={
            getEvent(home, '45') +
            getEvent(home, '59') +
            getEvent(home, '77') +
            getEvent(home, '258')
          }
          stat={'Turnovers Won'}
          awayStat={
            getEvent(away, '59') +
            getEvent(away, '59') +
            getEvent(away, '77') +
            getEvent(away, '258')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <StatsRow
          homeStat={
            getEvent(home, '46') +
            getEvent(home, '60') +
            getEvent(home, '78') +
            getEvent(home, '257')
          }
          stat={'Penalties conceded'}
          awayStat={
            getEvent(away, '46') +
            getEvent(away, '60') +
            getEvent(away, '78') +
            getEvent(away, '257')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <StatsRow
          homeStat={
            getSubEvent(home, '120', '46') +
            getSubEvent(home, '66', '54') +
            getSubEvent(home, '55', '544') +
            getSubEvent(home, '260', '694')
          }
          stat={'Yellow cards'}
          awayStat={
            getSubEvent(away, '120', '46') +
            getSubEvent(away, '66', '54') +
            getSubEvent(away, '55', '544') +
            getSubEvent(away, '260', '694')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />

        <StatsRow
          homeStat={
            getSubEvent(home, '120', '45') +
            getSubEvent(home, '66', '55') +
            getSubEvent(home, '55', '545') +
            getSubEvent(home, '260', '693')
          }
          stat={'Red cards'}
          awayStat={
            getSubEvent(away, '120', '45') +
            getSubEvent(away, '66', '55') +
            getSubEvent(away, '55', '545') +
            getSubEvent(away, '260', '693')
          }
          homeOnly={homeOnly}
          awayOnly={awayOnly}
          bothTeams={bothTeams}
        />
      </div>
    </article>
  )
}
