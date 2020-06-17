export default interface Shift {
    _id:              string;
    region:           Region;
    fromHour:         number;
    fromMinute:       number;
    toHour:           number;
    toMinute:         number;
    week:             number;
    date:             string;
    fromTimeExtended: number;
    toTimeExtended:   number;
    fromWithTimeZone: string;
    toWithTimeZone:   string;
    from:             string;
    to:               string;
    fromUnixOffset:   number;
    toUnixOffset:     number;
    absence:          boolean;
    bonus?:           boolean;
    absenceType?:     AbsenceType | null;
    published:        boolean;
    type:             Type;
    createdAt:        string;
    createdBy:        string;
    updatedAt:        string;
    absenceReason?:   null | string;
    wasOpenShift?:    boolean;
}

export enum AbsenceType {
    Free = "free",
}

export enum Region {
    NlGroningen = "nl:groningen",
}

export enum Type {
    Normal = "normal",
}
