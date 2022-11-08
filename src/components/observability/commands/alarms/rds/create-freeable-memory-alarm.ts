import AlarmBuilder from '../../../builders/alarm-builder';
import { AlarmStore } from '../../../stores';
import { AlarmExtraConfigs, RdsConfig } from '../../../types';
import { CreateAlarmCommand } from '../../create-alarm-command';

export class CreateFreeableMemoryAlarmCommand extends CreateAlarmCommand {
    constructor(
        readonly name: string,
        readonly threshold: number,
        readonly configs: RdsConfig,
        readonly extraConfigs?: AlarmExtraConfigs
    ) {
        super();
    }

    execute(parent?: AlarmStore) {
        const { dbInstanceIdentifier } = this.configs;

        const logicalName = `${this.name}-freeable-memory`;

        const comparisonOperator = 'LessThanOrEqualToThreshold';
        const anomalyDetectionComparisonOperator = 'LessThanLowerThreshold';
        const namespace = 'AWS/RDS';
        const metricName = 'FreeableMemory';
        const stat = 'Average';
        const dimensions = { DBInstanceIdentifier: dbInstanceIdentifier };

        const alarmBuilder = new AlarmBuilder()
            .name(logicalName, this.extraConfigs?.suffix)
            .threshold(this.threshold)
            .comparisonOperator(comparisonOperator)
            .evaluationPeriods(this.extraConfigs?.evaluationPeriods)
            .dataPointsToAlarm(this.extraConfigs?.datapointsToAlarm)
            .treatMissingData(this.extraConfigs?.treatMissingData)
            .snsTopicArns(this.extraConfigs?.snsTopicArns)
            .setParent(parent)
            .addMetric({
                id: 'm1',
                stat,
                dimensions,
                metricName,
                namespace,
                period: this.extraConfigs?.period,
                returnData: true,
            });

        if (this.threshold === 0) {
            alarmBuilder.anomalyDetection({
                thresholdMetricId: 'e1',
                anomalyComparison: anomalyDetectionComparisonOperator,
                metricToWatchId: 'm1',
                label: metricName,
            });
        }

        return alarmBuilder.build();
    }
}
