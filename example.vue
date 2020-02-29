<template>
    <div style="margin: 100px auto; max-width: 500px;">
        <date-picker v-model="v" v-slot="{ open, value }" :jalaali.sync="jalaali">
            <input style="width: 100%" :value="value" type="text" @click="open" readonly>
        </date-picker>
    </div>
</template>

<script>
import DatePicker from './src/components/date-picker'

export default {
    components: {
        DatePicker
    },

    data () {
        return {
            v: [null, null],
            jalaali: true,
        }
    },

    mounted () {
        document.body.style.backgroundColor = '#f2f2f2'
    }
}
</script>
