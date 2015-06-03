<?php

namespace Curry\Backend;

use Curry\Form\ModelForm;
use Curry\ModelView\ListView;
use Curry\Tree\PropelTree;
use Curry\Tree\Tree;
use Curry\View;
use Symfony\Component\HttpFoundation\Request;

class Pages extends AbstractBackend {
	public function initialize()
	{
		$this->addView('menu', $this->getMenu());
		$this->addView('list', new ListView('Page', array(
			'maxPerPage' => 5,
			'columns' => array(
				//'_pk' => array('hide' => false),
				//'user_role_id' => array('width' => 120, 'align' => 'right'),
			),
		)));
		$this->addViewFunction('properties', array($this, 'showProperties'), ':id/');
		$this->addViewFunction('content', array($this, 'showContent'), ':id/content/');
	}

	protected function getPage(View $view, $permission)
	{
		$page = \PageQuery::create()->findPk($view['id']);
		if (!$page)
			throw new \Exception('Page not found');

		$user = \User::getUser();
		if ($user && $user->hasPagePermission($page, $permission))
			return $page;

		throw new \Exception('Access denied');
	}

	protected function getPageViews(\Page $page)
	{
		$items = array(
			'properties' => \PageAccessPeer::PERM_PROPERTIES,
			'content' => \PageAccessPeer::PERM_CONTENT,
		);
		return array_keys($items);
	}

	protected function addMenuItems(\Page $page)
	{
		$names = array(
			'properties' => 'Properties',
			'content' => 'Content',
		);
		foreach($this->getPageViews($page) as $id) {
			$this->addMenuItem($names[$id], $this->$id->url(array('id' => $page->getPageId())));
		}
	}

	protected function getMenu()
	{
		$query = \PageQuery::create();
		$tree = new PropelTree($query, array(
			'minExpandLevel' => 2,
			'autoFocus' => false,
			'selectMode' => 1, // single
			'dndCallback' => array(__CLASS__, 'movePage'),
			'nodeCallback' => array($this, 'getPageTreeNode'),
		));
		// Override tree cookies to force tree selection
		$cookieId = $tree->getOption('cookieId');
		setcookie($cookieId."-focus", isset($_GET['page_id']) ? $_GET['page_id'] : null);
		setcookie($cookieId."-select", isset($_GET['page_id']) ? $_GET['page_id'] : null);

		return $tree;
	}

	/**
	 * Get page tree node properties.
	 *
	 * @param \Page $page
	 * @param Tree $tree
	 * @param int $depth
	 * @return array
	 */
	public function getPageTreeNode($page, Tree $tree, $depth = 0)
	{
		$p = $tree->objectToJson($page, $tree, $depth);

		if($page->getWorkingPageRevisionId() && $page->getWorkingPageRevisionId() !== $page->getActivePageRevisionId()) {
			$p['title'] .= '*';
			$p['addClass'] = 'page-unpublished';
		}

		$p['expand'] = true;
		$p['href'] = $this->properties->url(array('id' => $page->getPageId()));

		// Mark active node
		if(isset($_GET['page_id']) && $_GET['page_id'] == $page->getPageId())
			$p['activate'] = $p['focus'] = $p['select'] = true;

		// Icon
		$p['iconClass'] = 'no-icon';
		if(\Curry_Backend_Page::isTemplatePage($page)) {
			if ($page === \Curry_Backend_Page::getTemplatePage())
				$p['title'] .= ' <span class="icon-columns"></span>';
		} else {
			$icon = "";
			if(!$page->getEnabled())
				$icon .= '<span class="icon-lock" title="Inactive"></span>';
			if(!$page->getVisible())
				$icon .= '<span class="icon-eye-close" title="Do not show in menu"></span>';
			if($page->getRedirectMethod())
				$icon .= '<span class="icon-link" title="Redirect"></span>';
			if ($icon)
				$p['title'] .= " $icon";
		}
		return $p;
	}

	public function show(Request $request)
	{
		$this->addMainContent($this->list);
		return $this->render();
	}

	public function showContent(Request $request, View $view)
	{
		$page = $this->getPage($view, \PageAccessPeer::PERM_PROPERTIES);
		$this->addMenuItems($page);

		return $this->render();
	}

	public function showProperties(Request $request, View $view)
	{
		$page = $this->getPage($view, \PageAccessPeer::PERM_PROPERTIES);
		$this->addMenuItems($page);

		$this->addBreadcrumb('Pages', $view->parent->url());
		$this->addBreadcrumb($page->getName(), $view->url());

		$form = new ModelForm('Page', array(
			'ignoreFks' => false,
			'columnFields' => array(
				'uid' => false,
				'active_page_revision_id' => false,
				'working_page_revision_id' => false,
				'created_at' => false,
				'updated_at' => false,
				'tree_left' => false,
				'tree_right' => false,
				'tree_level' => false,
			),
		));
		$form->fillForm($page);
		if ($request->isMethod('POST') && $form->isValid($request->request->all())) {
			$form->fillModel($page);
		}
		$this->addMainContent($form->render());

		return $this->render();
	}

	public function render()
	{
		//$this->addMenuContent($this->menu);
		return parent::render();
	}
}