import { PROFILE } from '../../data/profile';

export function About() {
  return (
    <>
      <h1 className="id-name">{PROFILE.name}</h1>
      <p className="id-sub">{PROFILE.tagline}</p>
      <span className="status"><i />{PROFILE.status}</span>
      <dl className="kv">
        <dt>Focus</dt><dd>{PROFILE.focus}</dd>
        {PROFILE.email && (<><dt>Email</dt><dd><a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a></dd></>)}
        <dt>GitHub</dt><dd><a href={PROFILE.github.url} target="_blank" rel="noopener">{PROFILE.github.label}</a></dd>
        {PROFILE.resumeUrl && (<><dt>Résumé</dt><dd><a href={PROFILE.resumeUrl} target="_blank" rel="noopener">resume.pdf</a></dd></>)}
      </dl>
    </>
  );
}
