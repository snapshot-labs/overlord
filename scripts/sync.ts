import { db } from './mysql';
import { getVpValueByStrategy, strategies } from '../src';

const PROPOSAL_LIMIT = 20;

const strategyNames = Object.keys(strategies);
const placeholders = strategyNames.map(() => '?').join(',');

async function processProposal(proposal) {
  const results = await getVpValueByStrategy(
    parseInt(proposal.network),
    proposal.created,
    proposal.strategies
  );

  const scoresByStrategy = Array.from({ length: proposal.strategies.length }, (_, i) =>
    proposal.scores_by_strategy.reduce((sum, scores) => sum + (scores[i] || 0), 0)
  );
  const valueByStrategy = scoresByStrategy.map((score, i) => score * results[i]);
  const totalValue = valueByStrategy.reduce((sum, value) => sum + value, 0);

  await db.queryAsync(
    `
    UPDATE
      proposals
    SET
      vp_value_by_strategy = ?,
      scores_total_value = ?,
      cb = 3
    WHERE
      id = ?
    LIMIT
      1;
    `,
    [JSON.stringify(results), totalValue, proposal.id]
  );

  if (totalValue > 0) {
    console.log(
      `https://snapshot.box/#/s:${proposal.space}/proposal/${proposal.id}`,
      '\nValue by strategy:',
      JSON.stringify(results),
      '\nStrategies:',
      proposal.strategies.map(s => s.name).join(', '),
      '\nTotal value:',
      totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })
    );
  }
}

async function start() {
  console.log('Sync in progress...');

  const proposals = await db
    .queryAsync(
      `
    SELECT
      p.title, p.created, p.id, p.network, p.space, p.start, p.strategies, p.scores_by_strategy, p.choices
    FROM
      proposals p
    INNER JOIN
      spaces s ON p.space = s.id
    WHERE
      p.cb != 3
      AND p.type != 'weighted'
      AND p.type != 'quadratic'
      AND JSON_OVERLAPS(JSON_EXTRACT(strategies, '$[*].name'), JSON_ARRAY(${placeholders}))
      AND UNIX_TIMESTAMP() > p.start
    ORDER BY
      p.created DESC
    LIMIT
      ?;
  `,
      [...strategyNames, PROPOSAL_LIMIT]
    )
    .map(proposal => ({
      ...proposal,
      strategies: proposal.strategies ? JSON.parse(proposal.strategies) : [],
      scores_by_strategy: proposal.scores_by_strategy ? JSON.parse(proposal.scores_by_strategy) : []
    }));

  if (proposals.length !== 0) {
    await Promise.all(proposals.map(proposal => processProposal(proposal)));
    await start();
  } else {
    console.log('Sync is done');
  }
}

start().catch(console.error);
