import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import Dropdown from 'antd/lib/dropdown';
import Modal from 'antd/lib/modal';
import Menu from 'antd/lib/menu';
import recordEvent from '@/services/recordEvent';
import { Moment } from '@/components/proptypes';
import { Timer } from '@/components/Timer';

import './Widget.less';

function WidgetDropdownButton({ extraOptions, showDeleteOption, onDelete }) {
  const WidgetMenu = (
    <Menu data-test="WidgetDropdownButtonMenu">
      {extraOptions}
      {(showDeleteOption && extraOptions) && <Menu.Divider />}
      {showDeleteOption && <Menu.Item onClick={onDelete}>Remove from Dashboard</Menu.Item>}
    </Menu>
  );

  return (
    <div className="widget-menu-regular">
      <Dropdown
        overlay={WidgetMenu}
        placement="bottomRight"
        trigger={['click']}
      >
        <a className="action p-l-15 p-r-15" data-test="WidgetDropdownButton">
          <i className="zmdi zmdi-more-vert" />
        </a>
      </Dropdown>
    </div>
  );
}

WidgetDropdownButton.propTypes = {
  extraOptions: PropTypes.node,
  showDeleteOption: PropTypes.bool,
  onDelete: PropTypes.func,
};

WidgetDropdownButton.defaultProps = {
  extraOptions: null,
  showDeleteOption: false,
  onDelete: () => {},
};

function WidgetDeleteButton({ onClick }) {
  return (
    <div className="widget-menu-remove">
      <a className="action" title="Remove From Dashboard" onClick={onClick} data-test="WidgetDeleteButton">
        <i className="zmdi zmdi-close" />
      </a>
    </div>
  );
}

WidgetDeleteButton.propTypes = { onClick: PropTypes.func };
WidgetDeleteButton.defaultProps = { onClick: () => {} };

function RefreshIndicator({ refreshStartedAt }) {
  return (
    <div className="refresh-indicator">
      <div className="refresh-icon">
        <i className="zmdi zmdi-refresh zmdi-hc-spin" />
      </div>
      <Timer from={refreshStartedAt} />
    </div>
  );
}

RefreshIndicator.propTypes = { refreshStartedAt: Moment.isRequired };

class Widget extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.node,
    footer: PropTypes.node,
    canEdit: PropTypes.bool,
    isPublic: PropTypes.bool,
    refreshStartedAt: Moment,
    menuOptions: PropTypes.node,
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    children: null,
    header: null,
    footer: null,
    canEdit: false,
    isPublic: false,
    refreshStartedAt: null,
    menuOptions: null,
    onDelete: () => {},
  };

  componentDidMount() {
    const { widget } = this.props;
    recordEvent('view', 'widget', widget.id);
  }

  deleteWidget = () => {
    const { widget, onDelete } = this.props;

    Modal.confirm({
      title: 'Delete Widget',
      content: 'Are you sure you want to remove this widget from the dashboard?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => widget.delete().then(onDelete),
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  render() {
    const { className, children, header, footer, canEdit, isPublic, refreshStartedAt, menuOptions } = this.props;
    const showDropdownButton = !isPublic && (canEdit || !isEmpty(menuOptions));
    return (
      <div className="widget-wrapper">
        <div className={cx('tile body-container', className)} data-refreshing={!!refreshStartedAt}>
          <div className="widget-actions">
            {showDropdownButton && (
              <WidgetDropdownButton
                extraOptions={menuOptions}
                showDeleteOption={canEdit}
                onDelete={this.deleteWidget}
              />
            )}
            {canEdit && <WidgetDeleteButton onClick={this.deleteWidget} />}
          </div>
          <div className="body-row widget-header">
            {refreshStartedAt && <RefreshIndicator refreshStartedAt={refreshStartedAt} />}
            {header}
          </div>
          {children}
          {footer && (
            <div className="body-row tile__bottom-control">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Widget;