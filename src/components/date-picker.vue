<template>
    <div class="j-datepicker">
        <slot :open="open" :focus="focus" :value="value" :clear="clear" />
        <div class="clearfix" />
        <span class="j-datepicker__backdrop" v-if="mobile" v-show="isOpen" />
        <div ref="dropdown"
             class="j-datepicker__wrapper"
             :class="[{ open: isOpen, 'j-datepicker__wrapper--gregorian': !jalaali, fade: !mobile }, alignment]"
        >
            <header class="j-datepicker__header" dir="rtl">
                <div>
                    <span>
                        <button type="button" class="btn btn-raw active" @click="setJalaali(!jalaali)">
                            {{ jalaali ? 'تغییر به میلادی' : 'تغییر به شمسی' }}
                        </button>
                    </span>
                    <span>
                        {{ !jalaali ? 'تقویم میلادی' : 'تقویم شمسی' }}
                    </span>
                    <span>
                        <button type="button" class="btn btn-raw btn-today hidden-xs pull-left" @click="goToday">برو به امروز</button>
                        <button v-if="mobile" type="button" class="close" @click="close">
                            <span class="svg-icon">
                                <close-icon />
                            </span>
                        </button>
                    </span>
                </div>
                <div class="j-datepicker__weekdays" v-if="mobile" :dir="!jalaali ? 'ltr' : 'rtl'">
                    <span class="text-center" v-for="i in 7" :key="i">{{ weekday(i - 1) }}</span>
                </div>
            </header>

            <div class="mb-2" v-if="!mobile && $slots.before">
                <slot name="before" />
            </div>

            <div class="j-datepicker__arrows hidden-xs">
                <button class="btn" type="button" @click="next(-1)" :disabled="disablePreviousMonth">
                    <arrow-icon class="block" :direction="!jalaali ? 'left' : 'right'" />
                </button>
                <button class="btn" type="button" @click="next(1)" :disabled="disableNextMonth">
                    <arrow-icon class="block" :direction="jalaali ? 'left' : 'right'" />
                </button>
            </div>

            <transition-group :name="transition" tag="div" class="j-datepicker__container" :class="transition">
                <div class="px-2 pb-2 pb-0-md" v-for="month in months" :key="month.unix()">
                    <calendar class="mx-auto"
                              :date="month"
                              :value="value"
                              :jalaali="jalaali"
                              :range="range"
                              :min-date="minDate"
                              :max-date="maxDate"
                              :day-classes="dayClasses"
                              @input="onDayClick"
                    >
                        <template v-if="$scopedSlots.day" slot-scope="props">
                            <slot name="day" v-bind="props" :focus="focus" :open="isOpen" />
                        </template>
                    </calendar>
                </div>
            </transition-group>

            <slot name="after" v-if="!mobile" />

            <hr class="hidden-xs mb-1 mt-0">
            <footer class="j-datepicker__footer" dir="rtl">
                <div v-if="mobile" class="row xs-gutter text-gray mb-2">
                    <div class="col-xs-6" @click="focus = 0" :class="{ 'text-orange': focus === 0 }">
                        <checkin-icon fill="currentColor" />
                        <div class="v-middle inline-block mr-1">
                            <div class="text-gray">
                                <slot name="date-text" :index="0">
                                    تاریخ رفت
                                </slot>
                            </div>
                            <div class="text-black text-ellipsis">
                                {{ value[0] ? value[0].format(jalaali ? 'jD jMMMM، dddd' : 'D MMMM, dddd') : (focus === 0 ? 'انتخاب کنید' : '--') }}
                            </div>
                        </div>
                    </div>
                    <div class="col-xs-6" v-if="range" @click="focus = 1" :class="{ 'text-orange': focus === 1 }">
                        <checkout-icon fill="currentColor" />
                        <div class="v-middle inline-block mr-1">
                            <div class="text-gray">
                                <slot name="date-text" :index="1">
                                    تاریخ برگشت
                                </slot>
                            </div>
                            <div class="text-black text-ellipsis">
                                {{ value[1] ? value[1].format(jalaali ? 'jD jMMMM، dddd' : 'D MMMM, dddd') : (focus === 1 ? 'انتخاب کنید' : '--') }}
                            </div>
                        </div>
                        <div class="pull-left mt-2" v-if="isRangePropSync">
                            <button type="button" class="btn btn-clear mt-1" @click.stop="setRange(false)">
                                &times;
                            </button>
                        </div>
                    </div>
                    <div class="col-xs-6 pt-2 text-ellipsis" v-else-if="isRangePropSync" @click.stop="setRange(true)">
                        <switch-button :value="false" />
                        <strong class="w-500 text-dark">بلیط برگشت <span class="hidden-xxs">می‌خواهم</span></strong>
                    </div>
                </div>
                <div v-else>
                    <p class="text-black w-500 font-12 m-0 hidden-xs">
                        تاریخ انتخابی شما:
                    </p>
                    <strong class="w-normal text-ellipsis" v-if="(value || []).filter(Boolean).length">
                        <span v-for="(d, i) in value" :key="i">
                            <template v-if="d">
                                <span class="separator" v-if="i !== 0 && value[0]" />
                                <button type="button" class="btn btn-clear ml-1" @click.stop="clear(i)">&times;</button>
                                <slot name="date-text" :index="i">
                                    {{ d.format(jalaali ? 'jD jMMMM' : 'D MMMM') }}
                                </slot>
                            </template>
                        </span>
                        <slot name="after-date-text" />
                    </strong>
                    <em v-else>---</em>
                </div>

                <div v-if="!autoClose">
                    <button type="button" class="j-datepicker__btn" style="min-width: 90px;" @click="close(true)" :disabled="(value || []).filter(Boolean).length !== (range ? 2 : 1)">
                        <slot name="confirm-button-caption" :open="isOpen">
                            تائید
                        </slot>
                    </button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script>
import moment from 'moment-jalaali';
import ArrowIcon from './icons/arrow';
import CheckinIcon from './icons/checkin-icon';
import CheckoutIcon from './icons/checkout-icon';
import CloseIcon from './icons/flat-close-icon';
import Calendar from './calendar';
import calendarMixin from './calendarMixin';

export default {

    components: {
        Calendar,
        ArrowIcon,
        CheckinIcon,
        CheckoutIcon,
        CloseIcon,
    },

    mixins: [calendarMixin],

    props: {
        value: {
            type: Array,
            default: () => [],
        },

        range: {
            type: Boolean,
            default: false,
        },

        minRange: {
            type: Number,
            default: 0,
        },

        // Auto close after select (no confirm button)
        autoClose: {
            type: Boolean,
            default: false,
        },

        // Align date picker to the 'left, right or middle (default)' container
        alignment: {
            type: String,
            default: null,
        },
    },

    data () {
        const [v] = this.value || [];
        return {
            currentDate: (v ? v.clone() : moment.utc()).startOf(this.jalaali ? 'jMonth' : 'month').startOf('day'),
            focus: null,
            transition: 'slide-left',
            isOpen: false,
        };
    },

    computed: {
        months () {
            if (this.ssr) return [];
            const baseMonth = this.currentDate;
            const monthType = this.jalaali ? 'jMonth' : 'month';
            if (!this.mobile) {
                return [baseMonth, baseMonth.clone().add(1, monthType)];
            }

            return new Array(this.diffMonth(this.maxDate, this.minDate)).fill(1).map((el, i) => {
                return moment.utc(this.minDate).startOf(monthType).add(i, monthType);
            });
        },

        disablePreviousMonth () {
            const month = this.months[0];
            return !month || month.clone().isBefore(moment(this.minDate), this.jalaali ? 'jMonth' : 'month');
        },

        disableNextMonth () {
            const month = this.months[this.months.length - 1];
            return !month || month.clone().isAfter(moment(this.maxDate), this.jalaali ? 'jMonth' : 'month');
        },

        isRangePropSync () {
            return !!this.$listeners['update:range'];
        },
    },

    watch: {
        minDate (t) {
            if (t) {
                const indexes = (this.value || []).map((d, i) => this.$moment(d).isBefore(t, 'day') ? i : null).filter(el => el != null);
                indexes.length > 1 ? this.clear() : indexes.forEach(this.clear);
            }
        },
        maxDate (t) {
            if (t) {
                const indexes = (this.value || []).map((d, i) => this.$moment(d).isAfter(t, 'day') ? i : null).filter(el => el != null);
                indexes.length > 1 ? this.clear() : indexes.forEach(this.clear);
            }
        },
        jalaali (t) {
            this.currentDate = (this.value[0] ? this.value[0].clone() : moment()).startOf(t ? 'jMonth' : 'month');
            setTimeout(this.scrollIntoView, 500);
        },
        isOpen (t) {
            !this.mobile && !t && this.value[0] && setTimeout(() => {
                this.currentDate = this.value[0].clone().startOf(this.jalaali ? 'jMonth' : 'month').startOf('day');
            }, 200);

            // Scroll to month on mobile view;
            this.mobile && this.$store.commit('setOverflow', t);
            this.scrollIntoView();
        },
        range (t) {
            if (this.isOpen) {
                if (!t && this.focus === 1) this.focus = 0;
                if (t && this.value[0]) this.focus = 1;
            }
        },
    },

    mounted () {
        this._listener = ({ target }) => {
            if ((target && this.$el.contains(target)) || target.hasAttribute('data-prevent-close')) return;
            this.close();
        };
        window.addEventListener('click', this._listener);
    },

    beforeDestroy () {
        window.removeEventListener('click', this._listener);
    },

    methods: {
        open (i) {
            this.isOpen = true;
            this.focus = typeof i === 'number' ? i : 0;
            this.$emit('open');
            !this.mobile && this.$nextTick(() => {
                const ref = this.$refs.dropdown;
                if (ref && ref.getBoundingClientRect) {
                    const rect = ref.getBoundingClientRect();
                    if (rect.bottom > window.innerHeight) {
                        window.scrollTo({
                            left: 0,
                            top: rect.bottom - window.innerHeight + window.scrollY + 30,
                            behavior: 'smooth',
                        });
                    }
                }
            });
        },

        close (done) {
            this.isOpen = false;
            this.focus = null;
            done === true && this.$emit('done');
        },

        next (step = 1) {
            if (this.jalaali) {
                this.transition = step > 0 ? 'slide-left' : 'slide-right';
            } else {
                this.transition = step > 0 ? 'slide-right' : 'slide-left';
            }
            this.currentDate = this.currentDate.clone().add(step, this.jalaali ? 'jMonth' : 'month').startOf(this.jalaali ? 'jMonth' : 'month');
        },

        onDayClick (day) {
            if (day.isBefore(this.minDate, 'day')) return;
            if (day.isAfter(this.maxDate, 'day')) return;
            let { focus, minRange } = this;
            focus = focus != null ? focus : 0;
            const value = (this.value || []).slice();

            if (focus === 0 && value[1] && value[1].isBefore(day)) {
                value[1] = null;
            }
            if (focus === 1 && value[0] && value[0].isAfter(day)) {
                this.focus = focus = 0;
            }

            // Check minimum valid range
            if (focus === 1 ? value[0] && day.diff(value[0], 'days') < minRange : value[1] && value[1].diff(day, 'days') < minRange) {
                if (!focus) value[1] = null;
                else return;
            }

            value[focus] = day;
            this.$emit('input', value);

            // Switch to next
            if (focus === 0 && this.range) {
                this.focus = 1;
            }
            if (focus === 1 || (!this.range && focus === 0)) this.focus = null;

            // Auto close
            if (this.autoClose && value.filter(Boolean).length === (this.range ? 2 : 1)) {
                this.close(true);
            }
        },

        clear (i) {
            if (typeof i === 'number') {
                const value = this.value.slice();
                value[i] = null;
                this.$emit('input', value);
                this.focus = value.findIndex(el => el === null);
                this.$emit('clear', i);
            } else {
                this.range ? this.$emit('input', [null, null]) : this.$emit('input', [null]);
                this.$emit('clear');
            }
        },

        goToday () {
            const today = moment().startOf('day');
            const diff = Math.ceil(this.currentDate.diff(today, 'month', true));
            if (diff !== 0 && diff !== -1) {
                this.transition = (this.jalaali ? diff > 0 : diff < 0) ? 'slide-right' : 'slide-left';
                this.currentDate = today.clone().startOf(this.jalaali ? 'jMonth' : 'month');
            }
            // this.onDayClick(today);

            // F
            setTimeout(this.flashToday, 100);
        },

        flashToday () {
            const el = this.$el.querySelector('.j-calendar__day .btn-today');
            if (el) {
                const animation = 'flashing';
                el.classList.add(animation);
                el.addEventListener('animationend', () => el.classList.remove(animation));
            }
        },

        diffMonth (m1, m2) {
            const [year, month] = this.jalaali ? ['jYYYY', 'jMM'] : ['YYYY', 'MM'];
            m1 = moment.utc(this.maxDate);
            m2 = moment.utc(this.minDate);
            return (m1.format(year) * 12 + m1.format(month) * 1) - (m2.format(year) * 12 + m2.format(month) * 1) + 1;
        },

        scrollIntoView () {
            if (this.mobile) {
                this.$nextTick(() => {
                    const { dropdown } = this.$refs;
                    let el = dropdown.querySelector('.j-calendar__day.selected') || dropdown.querySelector('.j-calendar__day.today');
                    for (let i = 0; i < 4; i++) el = el && el.parentNode ? el.parentNode : null;
                    el && el.scrollIntoView();
                });
            }
        },

        setJalaali (x) {
            this.$emit('update:jalaali', x);
        },

        setRange (x) {
            this.$emit('update:range', x);
        },
    },
};
</script>

<style lang="scss">
@import '../styles/vars';

@keyframes j-datepicker-flashing {

    0% {
        border: 1px dotted $today-border-color;
    }

    100% {
        border: 1px dotted $primary-color;
    }
}

.j-datepicker {
    z-index: auto;
    user-select: none;
    direction: rtl;
    font-family: inherit;

    button {
        outline: none !important;
        border: none;
        background-color: transparent;
        appearance: none;
        cursor: pointer;
        transition: all ease 150ms;
    }

    @media (min-width: 768px) {
        position: relative;
    }

    .input-group.focus {

        &::after {
            content: ' ';
            display: block;
            position: absolute;
            bottom: 0;
            right: 0;
            left: 0;
            height: 3px;
            z-index: 5;
            background-color: $primary-color;
        }
    }

    &__backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 4999;
    }

    @media (max-width: 767px) {

        &__backdrop, &__wrapper {
            animation: fade-in 250ms ease;
        }
    }

    &__wrapper {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: $bg-color;
        padding: 90px 10px 40px;
        overflow: auto;
        z-index: 5000;
        display: none;
        border-radius: 4px;

        &.open {
            display: block;
        }

        @media (min-width: 370px) {
            width: auto;
            height: auto;
            right: 10px;
            left: 10px;
            top: 10px;
            bottom: 10px;
        }

        @media (min-width: 768px) {
            position: absolute;
            padding: 15px 15px 10px;
            top: 100%;
            right: 50%;
            transform: translateX(50%);
            margin-top: 5px;
            width: 550px;
            height: auto;
            bottom: auto;
            overflow: hidden;

            &.left {
                transform: none;
                left: 0;
                right: auto;
            }

            &.right {
                transform: none;
                right: 0;
                left: auto;
            }
        }

        &--gregorian {
            direction: ltr;
        }
    }

    &__container {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        position: absolute;
        top: 100px;
        left: 0;
        right: 0;
        bottom: 105px;
        overflow: auto;
        padding: 10px;

        &.slide-left {
            justify-content: flex-end;
        }

        .j-datepicker__wrapper--gregorian &.slide-right {
            justify-content: flex-end;
        }

        .j-datepicker__wrapper--gregorian &.slide-left {
            justify-content: flex-start;
        }

        > div {
            flex: 100% 1 1;
            transition: transform 160ms linear;
            position: relative;

            &:not(:last-child)::after {
                content: ' ';
                position: absolute;
                display: block;
                background-color: $separator-color;
                bottom: 0;
                left: 0;
                right: 0;
                height: 1px;
                @media (min-width: 768px) {
                    top: 40px;
                    bottom: 10px;
                    width: 1px;
                    right: auto;
                    height: auto;
                }
            }
        }

        .j-datepicker__wrapper--gregorian & > div::after {
            left: auto;
            right: 0;
        }

        @media (min-width: 768px) {
            position: static;
            overflow: hidden;
            flex-wrap: nowrap;
            padding: 0;
            margin: 0 -10px;

            > div {
                flex: 50% 0 0;
            }
        }
    }

    &__weekdays {
        background-color: $bg-color;
        display: flex;
        color: $weekday-color;
        padding: 5px 20px 10px;
        z-index: 10;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        border-bottom: 1px solid $separator-color;

        > span {
            flex: 1;
        }
    }

    &__arrows {
        position: absolute;
        left: 0;
        right: 0;
        display: flex;
        z-index: 8;
        justify-content: space-between;
        padding: 0 15px;

        > button {
            $color: #555;
            display: inline-block;
            color: $color;
            background-color: rgba($color, 0.12);
            border: 1px solid rgba($color, 0.18);
            height: 26px;
            width: 26px;
            line-height: 26px;
            border-radius: 4px;

            &:hover:not(:disabled) {
                border-color: $primary-color;
                background-color: $primary-color;
                color: #FFF;
            }

            &:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }

            svg {
                display: block;
                margin: 0 auto;
            }
        }
    }

    &__header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 12;
        font-family: 'IranSans', 'Tahoma', serif;

        > div {
            display: flex;
            position: relative;
            z-index: 14;
            align-items: center;

            > span {
                flex: 1;
            }

            > span:nth-child(2) {
                text-align: center;
            }

            > span:last-child {
                text-align: left;
            }
        }

        .close {
            font-size: 32px;
            padding: 12px;
            opacity: 1;
            color: $primary-color;
            position: static;
        }

        @media (min-width: 768px) {
            position: static;
            border-bottom: 1px solid $separator-color;
            margin-top: -5px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            font-size: 13px;
        }
    }

    .btn {
        font-size: inherit;
    }

    &__footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: $bg-color;
        padding: 10px;
        z-index: 12;
        box-shadow: 0 -15px 35px rgba(0, 0, 0, 0.06);
        font-family: 'IranSans', 'Tahoma', serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        font-size: 13px;

        .btn {
            font-size: 1.23em;
        }

        @media (min-width: 768px) {
            flex-direction: row;
            align-items: center;
            position: static;
            padding: 0;
            box-shadow: none;

            .btn {
                font-size: 1em;
            }
        }
    }

    .j-datepicker__btn {
        background-color: $btn-color;
        border: 1px solid $btn-color;
        color: #FFF;
        padding: 7px 15px;
        border-radius: 4px;
        transition: all ease 150ms;

        &:hover {
            background-color: darken($btn-color, 3%);
            border: 1px solid darken($btn-color, 3%);
        }

        &:disabled {
            background-color: rgba(0,0,0, 0.2);
            border: 1px solid transparent;
        }
    }

    hr {
        border-color: $separator-color;
    }

    /deep/ {
        .btn-today {
            border: 1px dotted $today-border-color;
            position: relative;
            border-radius: 4px;

            &::before {
                $width: 6px;
                content: ' ';
                display: block;
                position: absolute;
                top: -$width;
                right: -$width;
                border: $width solid transparent;
                border-bottom-color: inherit;
                transform: rotate(45deg);
            }

            &.flashing {
                animation: j-datepicker-flashing 0.3s 5 ease;
                animation-fill-mode: both;
                animation-direction: alternate;
            }
        }

        .btn-clear {
            border-radius: 100%;
            background-color: $clear-color;
            color: #FFF !important;
            height: 15px;
            width: 15px;
            line-height: 15px;
            padding: 0;
            outline: none !important;

            &:hover {
                background-color: darken($clear-color, 6%);
            }
        }
    }
}

.separator {
    display: inline-block;
    width: 10px;
    height: 1px;
    background-color: #212121;
    vertical-align: middle;
    margin: 0 10px;
}

@media (min-width: 768px) {

    .slide-left {

        &-enter {
            transform: translate3d(-100%, 0, 0);
        }

        &-leave-to {
            transform: translate3d(100%, 0, 0);
        }
    }

    .slide-right {

        &-enter {
            transform: translate3d(100%, 0, 0);
        }

        &-leave-to {
            transform: translate3d(-100%, 0, 0);
        }
    }
}
</style>
