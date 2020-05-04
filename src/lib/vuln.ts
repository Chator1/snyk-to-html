import * as _ from '@snyk/lodash';
import { ActionablePatch, ActionableRemediation, Vuln } from './types';

export const severityMap = { low: 0, medium: 1, high: 2 };

function getVuln(id, vulnerabilities: any): Vuln {
  const vuln = vulnerabilities.find((v) => v.id === id);
  return {
    id: vuln.id,
    title: vuln.title,
    severity: vuln.severity,
  };
}

export function getSeverityScore(vulns: Vuln[]) {
  return vulns.reduce((acc, vuln) => acc + (severityMap[vuln.severity] + 1), 0);
}

export function getUpgrades(
  upgrade: any,
  vulnerabilities: any,
): ActionableRemediation[] {
  const result: ActionableRemediation[] = [];
  Object.keys(upgrade).forEach((key) => {
    const { upgradeTo, vulns: vulnIds } = upgrade[key];
    const vulns: Vuln[] = vulnIds.map((id) => getVuln(id, vulnerabilities));
    const actionableRemediation: ActionableRemediation = {
      upgradeFrom: key,
      upgradeTo,
      vulns,
      severityScore: getSeverityScore(vulns),
    };
    result.push(actionableRemediation);
  });
  const sortedResult = _.orderBy(result, 'severityScore', 'desc');
  return sortedResult;
}

export function addIssueDataToPatch(remediation, vulnerabilities) {
  const patches: ActionablePatch[] = [];
  Object.entries(remediation).forEach(([pkg, pkgData]) => {
    const vuln = vulnerabilities.find((v) => v.id === pkg);
    const issueData = {
      severity: vuln.severity,
      title: vuln.title,
      name: vuln.packageName,
      version: vuln.version,
    };
    patches.push({id: pkg, issueData, paths: (pkgData as any).paths});
  });
  return patches;
}
