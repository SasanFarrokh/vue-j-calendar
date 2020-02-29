<template>
    <div class="j-calendar" :class="[jalaali ? 'j-calendar--jalaali rtl' : 'ltr font-en j-calendar--gregorian', range ? 'j-calendar--range' : '']">
        <h4 class="mb-1 mt-2 mt-1-sm w-normal px-2 text-darker" :class="{ 'font-en': !jalaali }">
            {{ monthName(date) }}
            <span v-if="!isCurrentYear">{{ date.format(jalaali ? 'jYY' : 'YYYY') }}</span>
        </h4>
        <div>
            <div class="j-calendar__weekdays hidden-xs">
                <span class="text-center" v-for="i in 7" :key="i">{{ weekday(i - 1) }}</span>
            </div>
            <div class="j-calendar__container">
                <div class="j-calendar__day before" v-for="i in shiftDays" :key="'s' + i">
                    <span class="j-calendar__day__square" />
                </div>
                <div v-for="({ day, classes }, i) in daysInMonth" :key="i"
                     ref="days"
                     class="j-calendar__day"
                     :class="classes"
                     @click="onDayClick(day)"
                >
                    <slot :day="day" :classes="classes">
                        <span class="j-calendar__day__content">{{ day.format(jalaali ? 'jD' : 'D') }}</span>
                    </slot>
                    <span class="j-calendar__day__square" />
                    <span class="btn-today" v-if="classes.today" />
                </div>
                <template v-if="!mobile">
                    <div class="j-calendar__day before" v-for="i in 7 - shiftDays" :key="'l' + i">
                        <span class="j-calendar__day__square" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment-jalaali';
import range from 'lodash/range';
import calendarMixin from './calendarMixin';

const setIm = typeof setImmediate === 'function' ? setImmediate : setTimeout;

export default {

    mixins: [calendarMixin],

    props: {
        date: {
            type: Object,
            default: () => moment.utc(),
        },

        value: {
            type: Array,
            default: () => [],
        },

        range: {
            type: Boolean,
            default: false,
        },
    },

    data () {
        return {
            daysInMonth: [],
        };
    },

    computed: {
        isCurrentYear () {
            return this.date.clone().isSame(moment.utc(), this.jalaali ? 'jYear' : 'year');
        },
        daysInMonthCount () {
            return this.jalaali ? moment.jDaysInMonth(this.date.jYear(), this.date.jMonth()) : this.date.daysInMonth();
        },

        shiftDays () {
            const weekday = this.daysInMonth[0] ? this.daysInMonth[0].day.weekday() : 0;
            return (this.jalaali ? weekday : weekday + 6) % 7;
        },
    },

    watch: {
        value: 'updateSelected',
    },

    mounted () {
        this.selected = [];
        this.calcDays();
        ['jalaali', 'daysInMonthCount', 'date', 'minDate', 'maxDate'].forEach(el => {
            this.$watch(el, this.calcDays);
        });
    },

    methods: {
        calcDays () {
            setIm(() => {
                this.daysInMonth = range(0, this.daysInMonthCount).map(this.calcDay);
            });
        },

        calcDay (i) {
            const day = this.date.clone().add(i, 'days');
            const classes = this.dayClasses(day, this.calcDayClass);
            (classes.selected || classes.highlight) && this.selected.push(i);
            return {
                day,
                classes,
            };
        },

        calcDayClass (day) {
            const { jalaali, daysInMonthCount } = this;
            return {
                before: day.isBefore(this.minDate, 'day') || day.isAfter(this.maxDate, 'day'),
                first: (jalaali ? day.jDate() : day.date()) === 1,
                last: (jalaali ? day.jDate() : day.date()) === daysInMonthCount,
                holiday: this.isHoliday(day),
                today: day.isSame(new Date(), 'day'),
                ...this.calcSelectedDayClass(day),
            };
        },

        calcSelectedDayClass (day) {
            const unix = day.unix();
            const [u0, u1] = (this.value || []).map(v => v ? v.unix() : null);
            const s0 = unix === u0;
            const s1 = unix === u1;
            return {
                selected: s0 || s1,
                'selected-0': s0,
                'selected-1': s1,
                highlight: u0 && u1 ? unix > u0 && unix < u1 : false,
            };
        },

        isHoliday (day) {
            return (this.jalaali ? [6] : []).includes(day.weekday());
        },

        onDayClick (day) {
            this.$emit('input', day, this);
        },

        updateSelected () {
            this.clearSelectedClasses();
            const value = this.value.filter(Boolean);
            if (value.length === 1) {
                const diff = value[0].diff(this.date, 'days');
                diff >= 0 && diff < this.daysInMonthCount && this.updateDay(value[0]);
            } else if (value.length > 1) {
                const diffs = value.map(d => Math.max(-1, Math.min(this.daysInMonthCount, d.diff(this.date, 'days'))));
                range(diffs[0], diffs[1] + 1).forEach(this.updateDay);
            }
        },

        clearSelectedClasses () {
            (this.selected || []).map(i => this.daysInMonth[i]).forEach(({ classes }) => {
                classes.selected = false;
                classes.highlight = false;
                classes['selected-0'] = false;
                classes['selected-1'] = false;
            });
            this.selected = [];
        },

        updateDay (value) {
            const i = typeof value === 'number' ? value : value[this.jalaali ? 'jDate' : 'date']() - 1;
            const day = this.daysInMonth[i];
            if (day) {
                day.classes = Object.assign(day.classes, this.calcSelectedDayClass(day.day));
                (day.classes.selected || day.classes.highlight) && this.selected.push(i);
            }
        },
    },
};
</script>

<style lang="scss">
@import '../styles/vars';

.j-calendar {
    * {
        box-sizing: border-box;
    }
    max-width: 340px;

    @mixin append {
        content: ' ';
        display: block;
        position: absolute;
    }

    > h4 {
        font-size: 13px;
        text-align: center;
        font-weight: 400;
    }

    &__weekdays {
        display: flex;
        padding: 10px 0;
        font-size: 0.8em;

        > span {
            flex: 1;
            text-align: center;
        }
    }

    &__container {
        display: flex;
        flex-wrap: wrap;
    }

    &__day {
        flex: (100% / 7) 0 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        cursor: pointer;
        border: 1px solid transparent;
        background-color: transparent;
        position: relative;
        margin: 2px 0;
        color: $day-color;
        font-weight: normal;

        &__content {
            position: relative;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        &__square {
            content: ' ';
            display: block;
            padding-bottom: 100%;
        }

        &.holiday {
            color: $holiday-color;
        }

        &:hover, &:active, &.selected {

            &::after {
                @include append;
                top: -1px;
                left: -1px;
                right: -1px;
                bottom: -1px;
                border: 2px solid lighten($primary-color, 14%);
                border-radius: 4px;
                z-index: 3;
                transition: background-color linear 120ms;
                background-color: $bg-color;
            }
        }
        @media (max-width: 767px) {

            &:hover::after {
                border-color: transparent;
            }
        }

        &.selected {
            color: darken($day-color, 10%);
            font-weight: 500;

            &::after {
                background-color: lighten($primary-color, 14%);
            }
        }

        &:active::after {
            background-color: darken($primary-color, 10%);
        }

        &.highlight {
            background-color: transparentize($primary-color, 0.65);
        }

        // Selected Trail

        &.highlight.selected-0::before, &.highlight.selected-1::before {
            @include append;
            top: -1px;
            right: -1px;
            width: 50%;
            bottom: -1px;
            background-color: $bg-color;
            z-index: 2;
        }

        &.highlight.selected-1::before {
            left: -1px;
            right: auto;
        }

        &.highlight.selected-0.selected-1 {
            background-color: transparent;
        }

        // Continue Trail

        &.highlight.first:not(.selected)::before, &.highlight.last:not(.selected)::before {
            @include append;
            right: -1px;
            top: -1px;
            bottom: -1px;
            width: 50%;
            background: linear-gradient(to left, $bg-color, rgba($bg-color, 0));
        }

        &.highlight.last:not(.selected)::before {
            right: auto;
            left: -1px;
            background: linear-gradient(to right, $bg-color, rgba($bg-color, 0));
        }

        &.before {
            opacity: 0.44;
            cursor: default;
            border-color: transparent;
            background-color: transparent;

            &::after {
                content: none;
                display: none;
            }
        }

        .btn-today {
            position: absolute !important;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
        }
    }

    &.j-calendar--range {

        .j-calendar__day {

            &.selected-0::after {
                border-radius: 0 4px 4px 0;
            }

            &.selected-1::after {
                border-radius: 4px 0 0 4px;
            }

            &.selected-1.selected-0::after {
                border-radius: 4px;
            }
        }
    }

    &.j-calendar--gregorian {

        .j-calendar__day {

            &.highlight.selected-0::before {
                left: -1px;
                right: auto;
            }

            &.highlight.selected-1::before {
                right: -1px;
                left: auto;
            }

            &.highlight.last:not(.selected)::before {
                left: auto;
                right: -1px;
                background: linear-gradient(to left, $bg-color, rgba($bg-color, 0));
            }

            &.highlight.first:not(.selected)::before {
                right: auto;
                left: -1px;
                background: linear-gradient(to right, $bg-color, rgba($bg-color, 0));
            }
        }

        &.j-calendar--range {

            .j-calendar__day {

                &.selected-0::after {
                    border-radius: 4px 0 0 4px;
                }

                &.selected-1::after {
                    border-radius: 0 4px 4px 0;
                }

                &.selected-1.selected-0::after {
                    border-radius: 4px;
                }
            }
        }
    }
}
</style>
