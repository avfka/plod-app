import * as Linking from 'expo-linking';

import { problemReportUrl, type ProblemContext } from './problem-report-url';

export { problemReportUrl, type ProblemContext } from './problem-report-url';

export async function reportProblem(context?: ProblemContext) {
  await Linking.openURL(problemReportUrl(context));
}
