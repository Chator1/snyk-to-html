import * as _ from '@snyk/lodash';
import { PatchRemediation, UpgradeRemediation, Vuln } from './types';

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
): UpgradeRemediation[] {
  const result: UpgradeRemediation[] = [];
  Object.keys(upgrade).forEach((key) => {
    const { upgradeTo, vulns: vulnIds, isTransitive } = upgrade[key];
    const vulns: Vuln[] = vulnIds.map((id) => getVuln(id, vulnerabilities));
    const actionableRemediation = {
      upgradeFrom: key,
      upgradeTo,
      vulns,
      severityScore: getSeverityScore(vulns),
      isTransitive,
    };
    result.push(actionableRemediation);
  });
  const sortedResult = _.orderBy(result, 'severityScore', 'desc');
  return sortedResult;
}

export function addIssueDataToPatch(remediation, vulnerabilities) {
  const patches: PatchRemediation[] = [];
  Object.entries(remediation).forEach(([pkg, pkgData]) => {
    const vuln = vulnerabilities.find((v) => v.id === pkg);
    const issueData = {
      severity: vuln.severity,
      title: vuln.title,
      id: pkg,
    };
    patches.push({ issueData, paths: (pkgData as any).paths,
    name: vuln.packageName, version: vuln.version });
  });
  return patches;
}
