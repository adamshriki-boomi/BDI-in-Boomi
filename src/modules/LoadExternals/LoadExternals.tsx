import { Chargebee } from 'modules/Billing/Chargebee';
import { LoadKapaScript } from 'modules/LoadExternals/KapaAndCandu';
import { isProdDomain } from 'utils/utils';

type ScriptType = {
  onload?: () => void;
  src: string;
  prodOnly?: boolean;
  id?: string;
};

export const loadExternalScripts = () => {
  if (!isProdDomain()) {
    Chargebee['dataBbSite'] = import.meta.env.VITE_BILLING_SITE + '-test';
  }
  loadScript(Chargebee);
  setTimeout(() => {
    // Setting a timeout so it wont collide with angular
    LoadKapaScript();
  }, 1000);
};

export const loadScript = ({
  onload = null,
  src,
  prodOnly = false,
  id = null,
}: ScriptType) => {
  if (prodOnly && !isProdDomain()) {
    return null;
  }
  var script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.onload = onload;
  script.src = src;
  // setTimeout(() => {
  script.id = id;
  document.head.appendChild(script);
  // }, 10);
  // document.head.appendChild(script);
};

export const createScriptNode = (val: string) => {
  var script = document.createElement('script');
  const node = document.createTextNode(val);
  script.appendChild(node);
  document.head.appendChild(script);
};
