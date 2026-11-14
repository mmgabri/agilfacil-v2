import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import buildInfo from '../../buildInfo.json';

// Compara a versão embutida no bundle (o que este navegador está rodando)
// com /version.json (o que está publicado). Se diferirem, é cache do navegador.
export const VersionPage = () => {
  const [deployed, setDeployed] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setDeployed)
      .catch(err => setError(err.message));
  }, []);

  const sameBuild = deployed && deployed.commit === buildInfo.commit && deployed.builtAt === buildInfo.builtAt;

  return (
    <Page>
      <Card>
        <Title>Versão do AgilFácil</Title>

        <Section>
          <Label>Rodando neste navegador</Label>
          <Info data={buildInfo} />
        </Section>

        <Section>
          <Label>Publicada no servidor</Label>
          {deployed && <Info data={deployed} />}
          {!deployed && !error && <Muted>Consultando…</Muted>}
          {error && <Muted>Não foi possível ler /version.json ({error})</Muted>}
        </Section>

        {deployed && (
          <Status $ok={sameBuild}>
            {sameBuild
              ? 'Você está na versão publicada.'
              : 'Seu navegador está com uma versão diferente da publicada. Recarregue com Ctrl+Shift+R.'}
          </Status>
        )}
      </Card>
    </Page>
  );
};

const Info = ({ data }) => (
  <Grid>
    <dt>Versão</dt><dd><strong>{data.version}</strong></dd>
    <dt>Commit</dt><dd><code>{data.commit}</code>{data.dirty && <Dirty> + alterações não commitadas</Dirty>}</dd>
    <dt>Branch</dt><dd>{data.branch}</dd>
    <dt>Data do commit</dt><dd>{formatDate(data.commitDate)}</dd>
    <dt>Build gerado em</dt><dd>{formatDate(data.builtAt)}</dd>
  </Grid>
);

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—');

export default VersionPage;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--bg);
  color: var(--text);
  box-sizing: border-box;
`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  padding: 24px;
  border-radius: 12px;
  background: var(--panel);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
`;

const Title = styled.h1`
  margin: 0 0 20px;
  font-size: 20px;
`;

const Section = styled.section`
  margin-bottom: 20px;
`;

const Label = styled.h2`
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
`;

const Grid = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  margin: 0;
  font-size: 14px;

  dt { color: var(--muted); }
  dd { margin: 0; word-break: break-word; }
`;

const Dirty = styled.span`
  color: var(--red);
  font-size: 12px;
`;

const Muted = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--muted);
`;

const Status = styled.p`
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid ${p => (p.$ok ? 'var(--green)' : 'var(--red)')};
  color: ${p => (p.$ok ? 'var(--green)' : 'var(--red)')};
`;
