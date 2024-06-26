<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.cloudgroup_single_action1') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.cloudgroup')" :count="params.data.length" :action="$t('cloudenv.cloudgroup_single_action1')" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.coludgroup_text001')">
          <list-select
            v-decorator="decorators.clouduser_ids"
            :listProps="clouduserSelectProps"
            :formatter="row => `${row.name} / ${row.cloudaccount || ''}`"
            :dialog-params="{ mask: false, width: 900, title: $t('rules.clouduser') }" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import get from 'lodash/get'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'
import { getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'CloudgroupSetUserDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          generate_name: '',
        },
      },
      decorators: {
        clouduser_ids: [
          'clouduser_ids',
          {
            validateFirst: true,
            initialValue: get(this.params.data[0], 'cloudusers', []).map(item => item.id),
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
      },
      clouduserSelectProps: {
        list: this.$list.createList(this, {
          resource: 'cloudusers',
          apiVersion: 'v1',
          getParams: () => {
            return {
              scope: this.$store.getters.scope,
              manager_id: this.params.data[0].manager_id,
              cloudaccount_id: this.params.data[0].cloudaccount_id,
            }
          },
          filterOptions: {
            name: getNameFilter(),
          },
        }),
        columns: [
          {
            field: 'name',
            title: this.$t('table.title.name'),
            showOverflow: 'title',
          },
          getStatusTableColumn({ statusModule: 'clouduser' }),
          {
            field: 'cloudaccount',
            title: this.$t('dictionary.cloudaccount'),
            showOverflow: 'title',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    paramClouduserIds () {
      return this.params.data[0] && this.params.data[0].cloudusers && this.params.data[0].cloudusers.map(item => item.id)
    },
  },
  watch: {
    paramClouduserIds (val) {
      if (val && val.length) {
        this.form.fc.setFieldsValue({
          clouduser_ids: val,
        })
      } else {
        this.form.fc.setFieldsValue({
          clouduser_ids: [],
        })
      }
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          steadyStatus: ['available'],
          id: this.params.data[0].id,
          managerArgs: {
            action: 'set-users',
            data: {
              ...values,
              provider: this.params.data[0].provider,
            },
          },
        })
        this.cancelDialog()
        this.$bus.$emit('CloudgroupSidepageClouduserListRefresh')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
