import { mapGetters } from 'vuex'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  // getNameDescriptionTableColumn,
  isPublicTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      // getNameDescriptionTableColumn({
      //   vm: this,
      //   hideField: true,
      //   slotCallback: row => {
      //     return (
      //       <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'NetworkSidePage') }>{ row.name }</side-page-trigger>
      //     )
      //   },
      // }),
      {
        field: 'name',
        title: '名称',
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            const ret = [
              <list-body-cell-wrap copy edit={ this.isPower(row) } row={row} list={this.list} hideField={ true }>
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
              </list-body-cell-wrap>,
              <list-body-cell-wrap edit={ this.isPower(row) } field="description" row={row} list={this.list} />,
            ]
            return ret
          },
        },
      },
      {
        field: 'ip',
        title: 'IP地址',
        width: 140,
        slots: {
          default: ({ row }) => {
            return [
              <div>起：{ row.guest_ip_start }</div>,
              <div>止：{ row.guest_ip_end }</div>,
            ]
          },
        },
      },
      {
        field: 'server_type',
        title: '类型',
        width: 60,
        formatter: ({ cellValue }) => {
          if (cellValue === 'baremetal') {
            return '物理机'
          }
          if (cellValue === 'container') {
            return '容器'
          }
          if (cellValue === 'guest') {
            return '虚拟机'
          }
          if (cellValue === 'pxe') {
            return 'PXE'
          }
          if (cellValue === 'ipmi') {
            return 'IPMI'
          }
          return '未知'
        },
      },
      getStatusTableColumn({ statusModule: 'network' }),
      {
        field: 'ports',
        title: '使用情况',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [
              <div class='text-truncate'>总计:{ row.ports }</div>,
              <div class='text-truncate'>使用:{ row.ports_used }</div>,
            ]
          },
        },
      },
      isPublicTableColumn(),
      getBrandTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn(),
      getCopyWithContentTableColumn({ field: 'wire', title: '二层网络' }),
      {
        field: 'vlan_id',
        title: 'VLAN',
        width: 60,
      },
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
      getCopyWithContentTableColumn({ field: 'account', title: '云账号' }),
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
