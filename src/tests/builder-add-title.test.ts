import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addTitle', () => {
  it('should add title element with string', () => {
    const result = new HeadBuilder().addTitle('My Page').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'title',
      attributes: { children: 'My Page' },
    });
  });

  it('should add title with template and default', () => {
    const result = new HeadBuilder()
      .addTitle({ template: '%s | My Site', default: 'Home' })
      .build();

    expect(result[0]).toEqual({
      type: 'title',
      attributes: { children: 'Home' },
    });
  });

  it('should apply template to subsequent string titles', () => {
    const result = new HeadBuilder()
      .addTitle({ template: '%s | My Site', default: 'Home' })
      .addTitle('About Us')
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'title',
      attributes: { children: 'About Us | My Site' },
    });
  });

  it('should update template when new template is set (default template)', () => {
    const result = new HeadBuilder()
      .addTitle({ template: '%s | Site A', default: 'Home' })
      .addTitle({ template: '%s | Site B', default: 'Index' })
      .build();

    expect(result[0]).toEqual({
      type: 'title',
      attributes: { children: 'Index' },
    });
  });

  it('should update template when new template is set (full template)', () => {
    const result = new HeadBuilder()
      .addTitle({ template: '%s | Site A', default: 'Home' })
      .addTitle({ template: '%s | Site B', default: 'Index' })
      .addTitle('Contact')
      .build();

    expect(result[0]).toEqual({
      type: 'title',
      attributes: { children: 'Contact | Site B' },
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addTitle('Title')).toBe(builder);
  });
});
