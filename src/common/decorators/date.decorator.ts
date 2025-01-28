import { registerDecorator, ValidationArguments, ValidatorOptions } from "class-validator";

export function IsDateLongerToday(validationOpts?: ValidatorOptions) {
    return function ( obj: Object, propertyName: string) {
        registerDecorator({
            name: 'isDateLongerToday',
            target: obj.constructor,
            propertyName: propertyName,
            options: validationOpts,
            validator: {
                validate( value: any, args: ValidationArguments) {
                    const currentDate = new Date();
                    const oneDayAfter = new Date(currentDate);
                    oneDayAfter.setDate(currentDate.getDate() + 1);

                    return value > oneDayAfter;
                },
                defaultMessage( args: ValidationArguments) {
                    return `${args.property} must be longer than one today.`;
                }
            }
        })
    }
}